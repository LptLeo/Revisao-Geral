import type { CookieOptions } from 'express';
import ms from 'ms';
import { env } from './env.ts';

export const AUTH_COOKIES = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
} as const;

export type AuthCookieName = keyof typeof AUTH_COOKIES;

const base = {
  httpOnly: true,
  secure: env.MODE === 'production',
  sameSite: 'strict',
} as const satisfies Omit<CookieOptions, 'maxAge'>;

export const authCookieOptions = {
  accessToken: { ...base, maxAge: ms(env.JWT_EXPIRES_IN) },
  refreshToken: { ...base, maxAge: ms(env.JWT_REFRESH_EXPIRES_IN) },
} as const satisfies Record<AuthCookieName, CookieOptions>;
