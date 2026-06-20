import type { NextFunction, Response } from 'express';
import { AuditLog } from '../modules/audit/audit.model.js';
import type { AuthRequest } from '../types/auth.js';

export function auditAction(action: string, resource: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (req.user) {
      await AuditLog.create({
        tenantId: req.user.tenantId,
        actorId: req.user.sub,
        action,
        resource,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { params: req.params }
      });
    }
    next();
  };
}
