import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authSchemas, loginController, logoutController, meController, refreshController } from '../../modules/auth/auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', validate(authSchemas.login), loginController);
authRouter.post('/refresh', refreshController);
authRouter.get('/me', requireAuth, meController);
authRouter.post('/logout', logoutController);
