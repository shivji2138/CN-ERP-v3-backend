import bcrypt from 'bcryptjs';
import { Role } from '../role/role.model.js';
import { User } from '../user/user.model.js';
import { ApiError } from '../../utils/api-error.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token.js';
import { redis } from '../../config/redis.js';
import type { BusinessRole, Panel, Permission } from '../../types/auth.js';

const refreshKey = (userId: string, tokenVersion: number) => `refresh:${userId}:${tokenVersion}`;

type AuthUserDocument = {
  _id: unknown;
  tenantId: unknown;
  email: string;
  passwordHash: string;
  panel: Panel;
  role: BusinessRole;
  roleId: unknown;
  tokenVersion: number;
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
};

type RoleDocument = {
  _id?: unknown;
  permissions: Permission[];
};

function cleanRoleSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function defaultPermissions(panel: Panel, role: BusinessRole): Permission[] {
  if (panel === 'SUPER_ADMIN') return ['*'];
  if (panel === 'ADMIN') {
    return [
      'department:read',
      'employee:read',
      'employee:create',
      'employee:update',
      'project:read',
      'project:create',
      'project:update',
      'task:read',
      'task:create',
      'task:update',
      'leave:read',
      'leave:approve',
      'report:read',
      'notification:read'
    ];
  }
  if (role === 'MANAGER') return ['employee:read', 'project:read', 'task:read', 'task:create', 'task:update', 'leave:read', 'notification:read'];
  return ['employee:read', 'project:read', 'task:read', 'leave:read', 'notification:read'];
}

async function resolveUserRole(user: AuthUserDocument) {
  const fallbackCode = user.panel === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : user.role;
  const fallbackName = user.panel === 'SUPER_ADMIN' ? 'Super Admin' : user.role;

  const role =
    ((await Role.findById(user.roleId).lean()) as RoleDocument | null) ??
    ((await Role.findOne({ tenantId: user.tenantId, code: fallbackCode, isDeleted: false }).lean()) as RoleDocument | null) ??
    ((await Role.findOne({ tenantId: user.tenantId, name: fallbackName, isDeleted: false }).lean()) as RoleDocument | null);

  if (role) return role;

  const createdRole = await Role.create({
    tenantId: user.tenantId,
    name: fallbackName,
    code: fallbackCode,
    slug: `${cleanRoleSlug(String(user.panel))}-${cleanRoleSlug(String(fallbackCode))}`,
    panel: user.panel,
    permissions: defaultPermissions(user.panel, user.role),
    isDeleted: false
  });

  await User.updateOne({ _id: user._id }, { roleId: createdRole._id, tokenVersion: user.tokenVersion ?? 0 });
  return createdRole.toObject() as unknown as RoleDocument;
}

export async function login(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = (await User.findOne({ email: normalizedEmail, isDeleted: false }).select('+passwordHash')) as AuthUserDocument | null;
  if (!user || user.status !== 'ACTIVE') throw new ApiError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const role = await resolveUserRole(user);
  if (!role) throw new ApiError(403, 'Role is not configured');

  const authPayload = {
    sub: String(user._id),
    tenantId: String(user.tenantId),
    panel: user.panel,
    role: user.role,
    permissions: role.permissions
  };

  const accessToken = signAccessToken(authPayload);
  const refreshToken = signRefreshToken({
    sub: String(user._id),
    tenantId: String(user.tenantId),
    panel: user.panel,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0
  });

  await redis.set(refreshKey(String(user._id), user.tokenVersion ?? 0), refreshToken, 'EX', 7 * 24 * 60 * 60);
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date(), tokenVersion: user.tokenVersion ?? 0 });

  return { user: authPayload, accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const stored = await redis.get(refreshKey(payload.sub, payload.tokenVersion));
  if (stored !== refreshToken) throw new ApiError(401, 'Invalid refresh token');

  const user = (await User.findById(payload.sub)) as AuthUserDocument | null;
  if (!user || user.tokenVersion !== payload.tokenVersion || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const role = await resolveUserRole(user);
  if (!role) throw new ApiError(403, 'Role is not configured');

  const accessPayload = {
    sub: String(user._id),
    tenantId: String(user.tenantId),
    panel: user.panel,
    role: user.role,
    permissions: role.permissions
  };

  return { accessToken: signAccessToken(accessPayload), user: accessPayload };
}

export async function logout(userId: string, tokenVersion: number) {
  await redis.del(refreshKey(userId, tokenVersion));
}

