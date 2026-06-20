import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createUserController,
  deleteUserController,
  listUsersController,
  updateUserController,
  userSchemas
} from '../../modules/user/user.controller.js';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/', requirePermission('user:read'), listUsersController);
userRouter.post('/', requirePermission('user:create'), validate(userSchemas.create), createUserController);
userRouter.patch('/:id', requirePermission('user:update'), validate(userSchemas.update), updateUserController);
userRouter.delete('/:id', requirePermission('user:delete'), deleteUserController);
