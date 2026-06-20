import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { reportController, reportExcelController, reportPdfController } from '../../modules/report/report.controller.js';
export const reportRouter = Router();
reportRouter.get('/', requireAuth, requirePermission('report:read'), reportController);
reportRouter.get('/export/excel', requireAuth, requirePermission('report:export'), reportExcelController);
reportRouter.get('/export/pdf', requireAuth, requirePermission('report:export'), reportPdfController);
