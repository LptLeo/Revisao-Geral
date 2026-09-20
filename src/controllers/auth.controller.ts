import type { Request, Response } from "express";
import type { AuthService } from "../services/auth.service.ts";

export class AuthController {
    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public register = async (req: Request, res: Response) => {
        const newUser = await this.authService.register(req.body);

        return res.status(201).json(newUser);
    }

    public login = async (req: Request, res: Response) => {
        const user = await this.authService.login(req.body);

        return res.status(200).json(user);
    }

    public refreshToken = async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        const tokens = await this.authService.refreshToken(refreshToken);

        return res.status(200).json(tokens);
    }
}