import { Router } from 'express';
import { UserController } from '../controllers/user.controller.ts';
import { UserService } from '../services/user.service.ts';
import AppDataSource from '../configs/AppDataSource.ts';
import { User } from '../entities/user.entity.ts';
import { findByIdUserSchema } from '../dtos/user.dto.ts';
import { ensureRole } from '../middlewares/role.middleware.ts';
import { ensureOwner } from '../middlewares/owner.middleware.ts';
import { validateParams } from '../middlewares/validateParams.middleware.ts';

const userService = new UserService(AppDataSource.getRepository(User));
const userController = new UserController(userService);
const userRouter = Router();

userRouter.get('/', ensureRole(['admin']), userController.findAll);
userRouter.get(
  '/:id',
  ensureOwner(['user']),
  validateParams(findByIdUserSchema),
  userController.findById
);

export default userRouter;
