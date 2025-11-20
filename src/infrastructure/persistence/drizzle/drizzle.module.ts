import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DrizzleService } from './drizzle.service';

export const DRIZZLE_DATABASE = Symbol('DRIZZLE_DATABASE');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Pool,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>('DATABASE_URL');

        if (!connectionString) {
          throw new Error('DATABASE_URL environment variable is not defined');
        }

        return new Pool({ connectionString });
      },
    },
    DrizzleService,
    {
      provide: DRIZZLE_DATABASE,
      inject: [DrizzleService],
      useFactory: (service: DrizzleService) => service.db,
    },
  ],
  exports: [DRIZZLE_DATABASE],
})
export class DrizzleModule {}
