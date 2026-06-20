import { ApiError } from '../utils/api-error.js';
export function requirePermission(...permissions) {
    return (req, _res, next) => {
        const userPermissions = req.user?.permissions ?? [];
        const allowed = userPermissions.includes('*') || permissions.some((permission) => userPermissions.includes(permission));
        if (!allowed)
            return next(new ApiError(403, 'Insufficient permissions'));
        return next();
    };
}
