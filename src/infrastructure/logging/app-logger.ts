import type { LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import type TransportStream from 'winston-transport';
import * as net from 'node:net';
import { Writable } from 'node:stream';

type LogstashAddress = { host: string; port: number };

export function parseLogstashUrl(raw?: string): LogstashAddress | null {
  if (!raw) return null;

  try {
    const normalized = raw.includes('://') ? raw : `tcp://${raw}`;
    const parsed = new URL(normalized);

    if (!parsed.hostname || !parsed.port) return null;

    return { host: parsed.hostname, port: Number(parsed.port) };
  } catch {
    const [host, port] = raw.split(':');

    if (!host || !port) return null;

    const numericPort = Number(port);

    if (!Number.isFinite(numericPort)) return null;

    return { host, port: numericPort };
  }
}

class LogstashSocket {
  private socket: net.Socket | null = null;
  private buffer: Buffer[] = [];
  private connecting = false;

  constructor(
    private readonly opts: {
      host: string;
      port: number;
      retryInterval?: number;
    },
  ) {}

  write(buf: Buffer, cb: (err?: Error | null) => void) {
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(buf, cb);
      return;
    }

    this.buffer.push(buf);
    this.ensureSocket();
    cb(null);
  }

  private ensureSocket() {
    if (this.connecting) return;
    this.connecting = true;

    const { host, port, retryInterval = 3000 } = this.opts;
    const sock = new net.Socket();
    sock.setKeepAlive(true);

    sock.connect(port, host, () => {
      this.socket = sock;
      this.connecting = false;

      for (const chunk of this.buffer) sock.write(chunk);
      this.buffer = [];
    });

    sock.on('error', () => {
      // swallow errors, reconnecting when socket closes
    });

    sock.on('close', () => {
      this.socket = null;
      this.connecting = false;
      setTimeout(() => this.ensureSocket(), retryInterval);
    });
  }
}

class LogstashWritable extends Writable {
  private readonly sock: LogstashSocket;

  constructor(opts: { host: string; port: number; retryInterval?: number }) {
    super();
    this.sock = new LogstashSocket(opts);
  }

  _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    const buf = Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk, encoding || 'utf8');

    this.sock.write(buf, callback);
  }
}

function toMessage(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input instanceof Error) return input.message;
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

export function createAppLogger(): LoggerService {
  const level = process.env.LOG_LEVEL || 'info';
  const app = process.env.SERVICE_NAME || 'fynd-core-api';
  const ls = parseLogstashUrl(process.env.LOGSTASH_URL);

  const baseFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  );

  const jsonLine = format.printf((info) => `${JSON.stringify(info)}\n`);
  const baseMeta = { app, env: process.env.NODE_ENV || 'dev' };

  const winstonTransports: TransportStream[] = [
    new transports.Console({
      level,
      format: baseFormat,
    }),
  ];

  if (ls) {
    winstonTransports.push(
      new transports.Stream({
        level,
        stream: new LogstashWritable({
          host: ls.host,
          port: ls.port,
          retryInterval: 3000,
        }),
        format: format.combine(
          format.timestamp(),
          format.errors({ stack: true }),
          format.splat(),
          jsonLine,
        ),
      }),
    );
  }

  const logger = createLogger({
    level,
    defaultMeta: baseMeta,
    transports: winstonTransports,
  });

  class NestWinstonLogger implements LoggerService {
    log(message: unknown, context?: string) {
      logger.info(toMessage(message), { context });
    }

    error(message: unknown, stack?: string, context?: string) {
      logger.error(toMessage(message), { context, stack });
    }

    warn(message: unknown, context?: string) {
      logger.warn(toMessage(message), { context });
    }

    debug?(message: unknown, context?: string) {
      logger.debug(toMessage(message), { context });
    }

    verbose?(message: unknown, context?: string) {
      logger.verbose(toMessage(message), { context });
    }
  }

  return new NestWinstonLogger();
}
