import { describe, it, expect, vi, afterEach } from 'vitest';
import { sanitizeResponse } from './sanitizeResponse.middleware.ts';
import type { Request, Response, NextFunction } from 'express';

const makeReq = (): Request => ({ method: 'GET', originalUrl: '/user/1' }) as unknown as Request;

const makeRes = () => {
  const json = vi.fn((body: unknown) => body as unknown as Response);
  return { res: { json } as unknown as Response, json };
};

const run = (json: ReturnType<typeof vi.fn>) => {
  const req = makeReq();
  const res = { json } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;

  sanitizeResponse(req, res, next);

  return { res, next };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('sanitizeResponse', () => {
  it('chama next', () => {
    const { next } = run(vi.fn());

    expect(next).toHaveBeenCalledOnce();
  });

  it('remove o campo password do corpo plano', () => {
    const { json } = makeRes();
    const { res } = run(json);

    res.json({ id: '1', name: 'Alice', password: 'hash' });

    expect(json).toHaveBeenCalledWith({ id: '1', name: 'Alice' });
  });

  it('remove campos sensíveis aninhados', () => {
    const { json } = makeRes();
    const { res } = run(json);

    res.json({ user: { id: '1', passwordHash: 'hash' } });

    expect(json).toHaveBeenCalledWith({ user: { id: '1' } });
  });

  it('remove campos sensíveis dentro de arrays', () => {
    const { json } = makeRes();
    const { res } = run(json);

    res.json([
      { id: '1', password: 'a' },
      { id: '2', password: 'b' },
    ]);

    expect(json).toHaveBeenCalledWith([{ id: '1' }, { id: '2' }]);
  });

  it('mantém objetos não sensíveis intactos', () => {
    const { json } = makeRes();
    const { res } = run(json);
    const body = { id: '1', name: 'Alice', roles: ['user'] };

    res.json(body);

    expect(json).toHaveBeenCalledWith(body);
  });

  it('preserva instâncias de Date sem tentar percorrê-las', () => {
    const { json } = makeRes();
    const { res } = run(json);
    const now = new Date();
    const body = { id: '1', createdAt: now };

    res.json(body);

    expect(json).toHaveBeenCalledWith({ id: '1', createdAt: now });
  });

  it('preserva primitivos e valores nulos', () => {
    const { json } = makeRes();
    const { res } = run(json);

    res.json('texto');
    expect(json).toHaveBeenCalledWith('texto');

    res.json(null);
    expect(json).toHaveBeenCalledWith(null);
  });

  it('avisa no console em modo development quando há campo sensível', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { json } = makeRes();
    const { res } = run(json);

    res.json({ password: 'hash' });

    expect(warn).toHaveBeenCalledOnce();
  });

  it('não avisa quando não há campo sensível', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { json } = makeRes();
    const { res } = run(json);

    res.json({ id: '1', name: 'Alice' });

    expect(warn).not.toHaveBeenCalled();
  });
});
