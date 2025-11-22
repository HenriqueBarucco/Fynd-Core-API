import { Inject, Injectable, Logger } from '@nestjs/common';
import { EasyWhatsApp } from 'easy-whatsapp-lib';
import { MessageSender } from '@domain/messaging/message-sender.interface';
import { File as MessageFile } from '@domain/messaging/file.interface';
import { WHATSAPP_CONNECTION } from './whatsapp.connection';

type WhatsAppImageFile = MessageFile;

@Injectable()
export class WhatsAppMessageSender implements MessageSender {
  private readonly logger = new Logger(WhatsAppMessageSender.name);

  constructor(
    @Inject(WHATSAPP_CONNECTION)
    readonly connection: EasyWhatsApp | null,
  ) {}

  async sendMessage(
    to: string,
    message: string,
    image?: MessageFile,
  ): Promise<void> {
    if (image) {
      await this.sendImage(to, image, message);
      return;
    }

    await this.executeOperation('message', to, (client) =>
      client.sendMessage(to, message),
    );
  }

  async sendImage(
    to: string,
    file: WhatsAppImageFile,
    message?: string,
  ): Promise<void> {
    await this.executeOperation('image', to, (client) =>
      client.sendImage(to, file, message),
    );
  }

  private async executeOperation(
    operation: 'message' | 'image',
    to: string,
    action: (connection: EasyWhatsApp) => Promise<void> | void,
  ): Promise<void> {
    const connection = this.getConnectionOrFail();

    try {
      await Promise.resolve(action(connection));
      this.logger.log(`Sent WhatsApp ${operation} to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp ${operation} to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error instanceof Error
        ? error
        : new Error(`Failed to send WhatsApp ${operation}: ${String(error)}`);
    }
  }

  private getConnectionOrFail(): EasyWhatsApp {
    if (!this.connection) {
      this.logger.warn(
        'WhatsApp connection not available, operation cannot be performed',
      );
      throw new Error('WhatsApp connection not initialized');
    }

    return this.connection;
  }
}
