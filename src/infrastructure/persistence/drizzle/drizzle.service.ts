import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type DrizzleDatabase = NodePgDatabase<typeof schema>;

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public readonly db: DrizzleDatabase;

  constructor(@Inject(Pool) private readonly pool: Pool) {
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
