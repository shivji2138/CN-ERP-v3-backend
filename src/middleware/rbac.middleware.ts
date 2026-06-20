import type { NextFunction, Response } from 'express';
import { ApiError } from '../utils/api-error.js';
import type { AuthRequest, Permission } from '../types/auth.js';

export function requirePermission(...permissions: Permission[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions ?? [];
    const allowed = userPermissions.includes('*') || permissions.some((permission) => userPermissions.includes(permission));
    if (!allowed) return next(new ApiError(403, 'Insufficient permissions'));
    return next();
  };
}
