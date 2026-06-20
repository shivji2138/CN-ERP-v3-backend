import type { Request } from 'express';

export type Panel = 'SUPER_ADMIN' | 'ADMIN' | 'USER';
export type BusinessRole = 'HR' | 'MANAGER' | 'EMPLOYEE' | 'INTERN';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export' | 'assign';

export type PermissionResource =
  | 'department'
  | 'role'
  | 'employee'
  | 'project'
  | 'task'
  | 'report'
  | 'announcement'
  | 'discussion'
  | 'leave'
  | 'payroll'
  | 'event'
  | 'ticket'
  | 'notification'
  | 'audit'
  | 'user';

export type Permission = `${PermissionResource}:${PermissionAction}` | '*';

export interface AuthUser {
  sub: string;
  tenantId: string;
  panel: Panel;
  role: BusinessRole;
  permissions: Permission[];
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

