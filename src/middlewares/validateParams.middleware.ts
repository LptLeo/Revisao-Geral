import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.params = schema.parse(req.params) as Request['params'];

    next();
  };
};
