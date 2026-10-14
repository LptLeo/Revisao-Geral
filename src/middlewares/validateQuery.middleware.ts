import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

// Express 5: req.query é um getter somente-leitura.
// O resultado validado é armazenado em res.locals.query.
export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.query = schema.parse(req.query);

    next();
  };
};
