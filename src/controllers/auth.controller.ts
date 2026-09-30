import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.ts';
import { cookieOptions } from '../configs/cookieConfig.ts';
import { AppError } from '../errors/AppError.ts';

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response) => {
    const newUser = await this.authService.register(req.body);

    return res.status(201).json(newUser);
  };

  public login = async (req: Request, res: Response) => {
    const { user, tokens } = await this.authService.login(req.body);

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    return res.status(200).json(user);
  };

  public refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token não fornecido', 401);
    }

    const tokens = await this.authService.refreshToken(refreshToken);

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    return res.status(200).json({
      accessToken: tokens.accessToken,
    });
  };

  public logout = async (_req: Request, res: Response) => {
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(204).send();
  };
}
