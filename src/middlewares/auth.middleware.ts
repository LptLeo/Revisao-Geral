import type { NextFunction, Request, Response } from 'express';
import type { Repository } from 'typeorm';
import { AppError } from '../errors/AppError.ts';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env.ts';
import AppDataSource from '../configs/AppDataSource.ts';
import { User } from '../entities/user.entity.ts';
import { AUTH_COOKIES } from '../configs/cookieConfig.ts';
import type { UserPayload } from '../types/user.types.ts';

export const createEnsureAuthenticated = (userRepository: Repository<User>) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let token = req.cookies?.[AUTH_COOKIES.accessToken];

    if (!token && req.headers?.authorization) {
      const [scheme, headerToken] = req.headers.authorization.split(' ');
      if (scheme === 'Bearer') {
        token = headerToken;
      }
    }

    if (!token) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }

    let decoded: UserPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    } catch {
      throw new AppError('Token inválido ou expirado', 401);
    }

    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user || !user.active) {
      throw new AppError('Usuário inativo ou inexistente', 401);
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };

    return next();
  };
};

export const ensureAuthenticated = createEnsureAuthenticated(AppDataSource.getRepository(User));
