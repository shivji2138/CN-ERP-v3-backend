import { AuditLog } from '../modules/audit/audit.model.js';
export function auditAction(action, resource) {
    return async (req, _res, next) => {
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
