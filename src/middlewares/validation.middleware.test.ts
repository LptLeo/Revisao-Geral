import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateBody } from './validation.middleware.ts';
import type { Request, Response, NextFunction } from 'express';

const makeRes = (): Response => ({}) as unknown as Response;
const makeNext = (): NextFunction => vi.fn() as unknown as NextFunction;

const schema = z.object({ name: z.string(), age: z.number() });

describe('validateBody', () => {
  it('substitui req.body pelo resultado validado e chama next', () => {
    const req = { body: { name: 'Alice', age: 30 } } as Request;
    const next = makeNext();

    validateBody(schema)(req, makeRes(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ name: 'Alice', age: 30 });
  });

  it('aplica transformações do schema no req.body', () => {
    const trimSchema = z.object({ name: z.string().trim() });
    const req = { body: { name: '  Alice  ' } } as Request;
    const next = makeNext();

    validateBody(trimSchema)(req, makeRes(), next);

    expect(req.body).toEqual({ name: 'Alice' });
  });

  it('lança ZodError quando um campo obrigatório está ausente', () => {
    const req = { body: { name: 'Alice' } } as Request;

    expect(() => validateBody(schema)(req, makeRes(), makeNext())).toThrow(z.ZodError);
  });

  it('lança ZodError quando um campo tem tipo errado', () => {
    const req = { body: { name: 'Alice', age: 'trinta' } } as Request;

    expect(() => validateBody(schema)(req, makeRes(), makeNext())).toThrow(z.ZodError);
  });

  it('lança ZodError para body vazio', () => {
    const req = { body: {} } as Request;

    expect(() => validateBody(schema)(req, makeRes(), makeNext())).toThrow(z.ZodError);
  });
});
