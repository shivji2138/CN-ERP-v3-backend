import { Router } from 'express';
import { authRouter } from './modules/auth.routes.js';
import { dashboardRouter } from './modules/dashboard.routes.js';
import { crudRouter } from './modules/crud.routes.js';
import { reportRouter } from './modules/report.routes.js';
import { userRouter } from './modules/user.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/', crudRouter);

