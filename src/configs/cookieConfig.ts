import type { CookieOptions } from 'express';
import { env } from './env.ts';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.MODE === 'production',
  sameSite: 'strict',
  maxAge: 3600000,
};
