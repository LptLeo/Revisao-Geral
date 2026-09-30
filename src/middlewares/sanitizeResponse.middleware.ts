import type { NextFunction, Request, Response } from 'express';
import { env } from '../configs/env.ts';

const SENSITIVE_KEYS = new Set(['password', 'passwordHash']);

const isOpaqueObject = (value: unknown): boolean => value instanceof Date || Buffer.isBuffer(value);

const containsSensitive = (body: unknown): boolean => {
  if (Array.isArray(body)) return body.some(containsSensitive);
  if (!body || typeof body !== 'object' || isOpaqueObject(body)) return false;

  return Object.entries(body).some(
    ([key, value]) => SENSITIVE_KEYS.has(key) || containsSensitive(value)
  );
};

const stripSensitive = (body: unknown): unknown => {
  if (Array.isArray(body)) return body.map(stripSensitive);
  if (!body || typeof body !== 'object' || isOpaqueObject(body)) return body;

  return Object.fromEntries(
    Object.entries(body)
      .filter(([key]) => !SENSITIVE_KEYS.has(key))
      .map(([key, value]) => [key, stripSensitive(value)])
  );
};

export const sanitizeResponse = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    if (env.MODE === 'development' && containsSensitive(body)) {
      console.warn(
        `[sanitizeResponse] Campo sensível removido de ${req.method} ${req.originalUrl}`
      );
    }

    return originalJson(stripSensitive(body));
  }) as Response['json'];

  next();
};
