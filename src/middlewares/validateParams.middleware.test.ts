import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateParams } from './validateParams.middleware.ts';
import type { Request, Response, NextFunction } from 'express';

const makeRes = (): Response => ({}) as unknown as Response;
const makeNext = (): NextFunction => vi.fn() as unknown as NextFunction;

const schema = z.object({ id: z.uuid() });

describe('validateParams', () => {
  it('mantém req.params válido e chama next', () => {
    const id = '00000000-0000-0000-0000-000000000000';
    const req = { params: { id } } as unknown as Request;
    const next = makeNext();

    validateParams(schema)(req, makeRes(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.params).toEqual({ id });
  });

  it('lança ZodError quando o param é inválido', () => {
    const req = { params: { id: 'nao-e-uuid' } } as unknown as Request;

    expect(() => validateParams(schema)(req, makeRes(), makeNext())).toThrow(z.ZodError);
  });

  it('lança ZodError quando o param obrigatório está ausente', () => {
    const req = { params: {} } as unknown as Request;

    expect(() => validateParams(schema)(req, makeRes(), makeNext())).toThrow(z.ZodError);
  });
});
