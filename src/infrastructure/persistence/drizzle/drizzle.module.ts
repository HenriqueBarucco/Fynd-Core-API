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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      provide: Pool,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const connectionString = config.getOrThrow<string>('DATABASE_URL');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
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
