import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../entities/user.entity.ts';
import { AppError } from '../errors/AppError.ts';

export const ensureOwner = (restrictedRoles: UserRole[], paramName = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    const resourceId = req.params[paramName];

    if (!user) {
      throw new AppError('Usuario não autenticado', 401);
    }

    const isRestrictedRole = restrictedRoles.includes(user.role);
    const isNotOwner = user.id !== resourceId;

    if (isRestrictedRole && isNotOwner) {
      throw new AppError('Acesso negado. Você só pode acessar seus próprios dados.', 403);
    }

    return next();
  };
};
