import { Router } from 'express';
import authRouter from './auth.routes.ts';
import userRouter from './user.routes.ts';
import { ensureAuthenticated } from '../middlewares/auth.middleware.ts';
import { asyncHandler } from '../middlewares/asyncHandler.middleware.ts';

const routes = Router();

routes.use('/auth', authRouter);
routes.use('/user', asyncHandler(ensureAuthenticated), userRouter);

export default routes;
