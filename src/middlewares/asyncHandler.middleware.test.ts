import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from './asyncHandler.middleware.ts';
import { AppError } from '../errors/AppError.ts';
import type { Request, Response, NextFunction } from 'express';

const makeReq = (): Request => ({}) as unknown as Request;
const makeRes = (): Response => ({}) as unknown as Response;
const makeNext = (): NextFunction => vi.fn() as unknown as NextFunction;

describe('asyncHandler', () => {
  it('não chama next em caso de sucesso', async () => {
    const fn = asyncHandler(async (_req, res) => {
      res.status?.(200);
    });
    const next = makeNext();

    await fn(makeReq(), makeRes(), next);

    expect(next).not.toHaveBeenCalled();
  });

  it('encaminha rejeição de promise para next', async () => {
    const error = new AppError('falhou', 400);
    const fn = asyncHandler(async () => {
      throw error;
    });
    const next = makeNext();

    await fn(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('encaminha Promise.reject para next', async () => {
    const error = new Error('rejeitado');
    const fn = asyncHandler(() => Promise.reject(error));
    const next = makeNext();

    await fn(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('não vaza a exceção para quem chamou (não lança sincronamente)', async () => {
    const fn = asyncHandler(async () => {
      throw new AppError('erro', 500);
    });
    const next = makeNext();

    expect(() => fn(makeReq(), makeRes(), next)).not.toThrow();
    await vi.waitFor(() => expect(next).toHaveBeenCalledOnce());
  });
});
