import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type DrizzleDatabase = NodePgDatabase<typeof schema>;

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public readonly db: DrizzleDatabase;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    @Inject(Pool) private readonly pool: Pool,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.pool.end();
  }
}
