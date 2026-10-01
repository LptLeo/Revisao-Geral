import { defineConfig } from 'vitest/config';

const testEnv: Record<string, string> = {
  MODE: 'development',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'test',
  DB_PASSWORD: 'test',
  DB_NAME: 'test',
  DB_EXTERNAL_PORT: '5432',
  SV_PORT: '3000',
  BCRYPT_SALT: '4',
  JWT_SECRET: 't'.repeat(64),
  JWT_REFRESH_SECRET: 'r'.repeat(64),
  JWT_EXPIRES_IN: '1d',
  JWT_REFRESH_EXPIRES_IN: '7d',
};

export default defineConfig({
  test: {
    environment: 'node',
    env: testEnv,
  },
});
