import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);

    next();
  };
};
