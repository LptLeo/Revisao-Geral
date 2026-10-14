import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateQuery } from './validateQuery.middleware.ts';
import type { Request, Response, NextFunction } from 'express';

const makeReq = (query: object): Request => ({ query }) as unknown as Request;

const makeRes = (): Response & { locals: Record<string, unknown> } =>
  ({ locals: {} }) as unknown as Response & { locals: Record<string, unknown> };

const makeNext = (): NextFunction => vi.fn() as unknown as NextFunction;

const schema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().optional(),
});

describe('validateQuery', () => {
  it('armazena a query validada em res.locals.query e chama next', () => {
    const req = makeReq({ page: '2', search: 'joao' });
    const res = makeRes();
    const next = makeNext();

    validateQuery(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.locals.query).toEqual({ page: 2, search: 'joao' });
  });

  it('aplica valores default quando o parâmetro está ausente', () => {
    const req = makeReq({});
    const res = makeRes();

    validateQuery(schema)(req, res, makeNext());

    expect(res.locals.query).toEqual({ page: 1 });
  });

  it('converte strings da query para os tipos do schema', () => {
    const req = makeReq({ page: '3' });
    const res = makeRes();

    validateQuery(schema)(req, res, makeNext());

    expect(res.locals.query).toEqual({ page: 3 });
  });

  it('lança ZodError e não chama next para query inválida', () => {
    const req = makeReq({ page: '0' });
    const res = makeRes();
    const next = makeNext();

    expect(() => validateQuery(schema)(req, res, next)).toThrow(z.ZodError);
    expect(next).not.toHaveBeenCalled();
  });

  it('não tenta reatribuir req.query (getter somente-leitura no Express 5)', () => {
    const req = makeReq({ page: '1' });
    const res = makeRes();

    validateQuery(schema)(req, res, makeNext());

    expect(req.query).toEqual({ page: '1' });
  });
});
