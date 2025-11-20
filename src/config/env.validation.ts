import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),
  EASY_WHATSAPP_KEY: z.string().min(1).optional(),
  LM_STUDIO_API_KEY: z.string().min(1).default('lm-studio'),
  LM_STUDIO_BASE_URL: z
    .string()
    .url({ message: 'LM_STUDIO_BASE_URL must be a valid URL' })
    .default('http://localhost:1234/v1'),
  LM_STUDIO_MODEL: z.string().min(1).default('gpt-4o-mini'),
  LM_STUDIO_PROMOTION_MODEL: z.string().min(1).optional(),
  LM_STUDIO_EMBEDDING_MODEL: z
    .string()
    .min(1)
    .default('text-embedding-3-small'),
  QDRANT_URL: z
    .string()
    .url({ message: 'QDRANT_URL must be a valid URL' })
    .default('http://localhost:6333'),
  QDRANT_API_KEY: z.string().min(1).optional(),
  QDRANT_COLLECTION: z.string().min(1).default('user_tastes'),
  QDRANT_VECTOR_SIZE: z.coerce.number().int().positive().default(1024),
  QDRANT_DISTANCE: z.enum(['Cosine', 'Dot', 'Euclid']).default('Cosine'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .optional(),
  SERVICE_NAME: z.string().min(1).default('fynd-core-api'),
  LOGSTASH_URL: z
    .string()
    .url({ message: 'LOGSTASH_URL must be a valid URL' })
    .optional(),
});

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid environment configuration: ${JSON.stringify(formatted)}`,
    );
  }

  const env = parsed.data;

  for (const key of Object.keys(env) as Array<keyof EnvVars>) {
    const value = env[key];

    if (value === undefined || value === null) continue;
    if (typeof value === 'object') continue;

    process.env[key] = typeof value === 'string' ? value : String(value);
  }

  return env;
}
