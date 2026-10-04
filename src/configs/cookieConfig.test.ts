import { describe, it, expect, afterEach, vi } from 'vitest';
import ms from 'ms';
import { env } from './env.ts';
import { AUTH_COOKIES, authCookieOptions } from './cookieConfig.ts';

const loadWithEnv = async (vars: { jwtExpiresIn: string; jwtRefreshExpiresIn: string }) => {
  vi.resetModules();
  vi.doMock('./env.ts', () => ({
    env: {
      MODE: 'development',
      JWT_EXPIRES_IN: vars.jwtExpiresIn,
      JWT_REFRESH_EXPIRES_IN: vars.jwtRefreshExpiresIn,
    },
  }));

  return import('./cookieConfig.ts');
};

afterEach(() => {
  vi.doUnmock('./env.ts');
  vi.resetModules();
});

describe('cookieConfig', () => {
  describe('AUTH_COOKIES', () => {
    it('expõe os nomes dos cookies de autenticação', () => {
      expect(AUTH_COOKIES.accessToken).toBe('accessToken');
      expect(AUTH_COOKIES.refreshToken).toBe('refreshToken');
    });
  });

  describe('authCookieOptions', () => {
    it('deriva o maxAge do accessToken de JWT_EXPIRES_IN', () => {
      expect(authCookieOptions.accessToken.maxAge).toBe(ms(env.JWT_EXPIRES_IN));
    });

    it('deriva o maxAge do refreshToken de JWT_REFRESH_EXPIRES_IN', () => {
      expect(authCookieOptions.refreshToken.maxAge).toBe(ms(env.JWT_REFRESH_EXPIRES_IN));
    });

    it('mantém o refreshToken vivo por mais tempo que o accessToken', () => {
      expect(authCookieOptions.refreshToken.maxAge).toBeGreaterThan(
        authCookieOptions.accessToken.maxAge as number
      );
    });

    it('aplica os mesmos atributos de proteção nos dois cookies', () => {
      const { accessToken, refreshToken } = authCookieOptions;

      expect(accessToken.httpOnly).toBe(true);
      expect(refreshToken.httpOnly).toBe(true);
      expect(accessToken.sameSite).toBe('strict');
      expect(refreshToken.sameSite).toBe('strict');
      expect(accessToken.secure).toBe(env.MODE === 'production');
      expect(refreshToken.secure).toBe(env.MODE === 'production');
    });

    it('recalcula o maxAge quando a duração do JWT muda no env', async () => {
      const { authCookieOptions: reloaded } = await loadWithEnv({
        jwtExpiresIn: '15m',
        jwtRefreshExpiresIn: '30d',
      });

      expect(reloaded.accessToken.maxAge).toBe(ms('15m'));
      expect(reloaded.refreshToken.maxAge).toBe(ms('30d'));
    });
  });
});
