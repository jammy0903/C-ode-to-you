import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

  // OAuth - Kakao
  KAKAO_CLIENT_ID: z.string(),
  KAKAO_CLIENT_SECRET: z.string(),
  KAKAO_CALLBACK_URL: z.string().url(),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),

  // OAuth - GitHub
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string().url(),

  // AI Model
  AI_API_URL: z.string().url(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL_NAME: z.string().default('qwen2.5-coder'),

  // Baekjoon API (optional)
  BAEKJOON_API_URL: z.string().url().optional().or(z.literal('')),
  BAEKJOON_API_KEY: z.string().optional().or(z.literal('')),

  // Redis (optional)
  REDIS_URL: z.string().optional().or(z.literal('')),
  REDIS_PASSWORD: z.string().optional().or(z.literal('')),

  // CORS
  CORS_ORIGIN: z.string(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
