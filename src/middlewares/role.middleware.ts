import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.ts';
import type { UserRole } from '../types/user.types.ts';

export const ensureRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError('Acesso negado: permissões insuficientes', 403);
    }

    return next();
  };
};
