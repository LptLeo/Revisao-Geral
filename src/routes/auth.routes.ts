import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { AuthService } from '../services/auth.service.ts';
import AppDataSource from '../configs/AppDataSource.ts';
import { User } from '../entities/user.entity.ts';
import { validateBody } from '../middlewares/validation.middleware.ts';
import { loginUserSchema, registerUserSchema } from '../dtos/auth.dto.ts';

const authService = new AuthService(AppDataSource.getRepository(User));
const authController = new AuthController(authService);
const authRouter = Router();

authRouter.post('/register', validateBody(registerUserSchema), authController.register);
authRouter.post('/login', validateBody(loginUserSchema), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh', authController.refreshToken);

export default authRouter;
