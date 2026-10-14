import { Router } from 'express';
import { UserController } from '../controllers/user.controller.ts';
import { UserService } from '../services/user.service.ts';
import AppDataSource from '../configs/AppDataSource.ts';
import { User } from '../entities/user.entity.ts';
import { findByIdUserSchema, listUsersSchema, updateUserSchema } from '../dtos/user.dto.ts';
import { validateBody } from '../middlewares/validation.middleware.ts';
import { validateQuery } from '../middlewares/validateQuery.middleware.ts';
import { asyncHandler } from '../middlewares/asyncHandler.middleware.ts';
import { ensureRole } from '../middlewares/role.middleware.ts';
import { ensureOwner } from '../middlewares/owner.middleware.ts';
import { validateParams } from '../middlewares/validateParams.middleware.ts';

const userService = new UserService(AppDataSource.getRepository(User));
const userController = new UserController(userService);
const userRouter = Router();

userRouter.get(
  '/',
  ensureRole(['admin']),
  validateQuery(listUsersSchema),
  asyncHandler(userController.findAll)
);
userRouter.get(
  '/:id',
  ensureOwner(['user']),
  validateParams(findByIdUserSchema),
  asyncHandler(userController.findById)
);
userRouter.put(
  '/:id',
  ensureOwner(['user']),
  validateParams(findByIdUserSchema),
  validateBody(updateUserSchema),
  asyncHandler(userController.update)
);

export default userRouter;
