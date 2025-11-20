import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/persistence/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgres://usr_fynd_core:fynd_core@localhost:5432/fynd',
  },
  strict: true,
  verbose: true,
});
