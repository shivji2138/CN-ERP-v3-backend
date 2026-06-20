import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { dashboardController } from '../../modules/dashboard/dashboard.controller.js';
export const dashboardRouter = Router();
dashboardRouter.get('/', requireAuth, requirePermission('report:read'), dashboardController);
