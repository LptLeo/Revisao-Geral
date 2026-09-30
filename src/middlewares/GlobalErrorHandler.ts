import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/AppError.ts';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Erro de validação nos dados enviados',
      details: z.flattenError(error).fieldErrors,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message || 'Erro interno não especificado',
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor',
  });
};
