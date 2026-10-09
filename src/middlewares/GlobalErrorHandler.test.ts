import { describe, it, expect, vi, afterEach } from 'vitest';
import { z } from 'zod';
import { errorHandler } from './GlobalErrorHandler.ts';
import { AppError } from '../errors/AppError.ts';
import type { Request, Response, NextFunction } from 'express';

const makeReq = (): Request => ({}) as unknown as Request;
const makeNext = (): NextFunction => vi.fn() as unknown as NextFunction;

const makeRes = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
};

const invoke = (error: unknown) => {
  const res = makeRes();
  errorHandler(error as Error, makeReq(), res, makeNext());
  return res;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('errorHandler', () => {
  it('responde 400 com detalhes para ZodError', () => {
    const zodError = (() => {
      try {
        z.object({ name: z.string() }).parse({});
      } catch (error) {
        return error as z.ZodError;
      }
      throw new Error('esperava ZodError');
    })();

    const res = invoke(zodError);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Erro de validação nos dados enviados',
        details: expect.objectContaining({ name: expect.any(Array) }),
      })
    );
  });

  it('responde com o statusCode e a message do AppError', () => {
    const res = invoke(new AppError('Recurso não encontrado', 404));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Recurso não encontrado',
    });
  });

  it('usa mensagem padrão quando o AppError não tem message', () => {
    const res = invoke(new AppError('', 400));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro interno não especificado',
    });
  });

  it('responde 500 e loga erro desconhecido', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = invoke(new TypeError('boom'));

    expect(consoleError).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro interno no servidor',
    });
  });

  it('responde 500 para valor lançado que não é Error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = invoke('string lançada');

    expect(consoleError).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
