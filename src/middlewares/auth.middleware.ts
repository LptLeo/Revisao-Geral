import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.ts';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env.ts';
import type { UserPayload } from '../types/user.types.ts';

export const ensureAuthenticated = (req: Request, _res: Response, next: NextFunction): void => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization) {
    const [scheme, headerToken] = req.headers.authorization.split(' ');
    if (scheme === 'Bearer') {
      token = headerToken;
    }
  }

  if (!token) {
    throw new AppError('Token de autenticação não fornecido', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };
    return next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
};
