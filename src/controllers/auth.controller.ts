import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.ts';
import { AUTH_COOKIES, authCookieOptions } from '../configs/cookieConfig.ts';
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

    res.cookie(AUTH_COOKIES.accessToken, tokens.accessToken, authCookieOptions.accessToken);
    res.cookie(AUTH_COOKIES.refreshToken, tokens.refreshToken, authCookieOptions.refreshToken);

    return res.status(200).json(user);
  };

  public refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[AUTH_COOKIES.refreshToken];

    if (!refreshToken) {
      throw new AppError('Refresh token não fornecido', 401);
    }

    const tokens = await this.authService.refreshToken(refreshToken);

    res.cookie(AUTH_COOKIES.accessToken, tokens.accessToken, authCookieOptions.accessToken);
    res.cookie(AUTH_COOKIES.refreshToken, tokens.refreshToken, authCookieOptions.refreshToken);

    return res.status(204).send();
  };

  public logout = async (_req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIES.accessToken, authCookieOptions.accessToken);
    res.clearCookie(AUTH_COOKIES.refreshToken, authCookieOptions.refreshToken);

    return res.status(204).send();
  };
}
