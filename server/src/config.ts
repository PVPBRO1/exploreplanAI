import 'dotenv/config';

function requiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function numericEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${raw}`);
  }
  return parsed;
}

function boolEnv(key: string, fallback: boolean): boolean {
  const raw = process.env[key]?.toLowerCase();
  if (raw === undefined || raw === '') return fallback;
  return raw === 'true' || raw === '1';
}

export const config = {
  port: numericEnv('PORT', 8787),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  logLevel: optionalEnv('LOG_LEVEL', 'info'),
  corsOrigin: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),

  openai: {
    apiKey: requiredEnv('OPENAI_API_KEY'),
    model: optionalEnv('OPENAI_MODEL', 'gpt-4o-mini'),
    timeoutMs: numericEnv('OPENAI_TIMEOUT_MS', 30_000),
    store: boolEnv('OPENAI_STORE', false),
  },

  rateLimit: {
    max: numericEnv('RATE_LIMIT_MAX', 60),
    timeWindow: optionalEnv('RATE_LIMIT_WINDOW', '1 minute'),
  },

  get isDev() {
    return this.nodeEnv === 'development';
  },

  get isProd() {
    return this.nodeEnv === 'production';
  },
} as const;
