import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import type { Response } from 'express';
import { z } from 'zod';
import { Role } from '../role/role.model.js';
import { User } from './user.model.js';
import type { AuthRequest } from '../../types/auth.js';
import { ApiError } from '../../utils/api-error.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getPagination } from '../../utils/pagination.js';

const COMPANY_DOMAIN = 'cybernaut.com';

export const userSchemas = {
  create: z.object({
    body: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      designation: z.string().min(1),
      panel: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']).default('USER'),
      role: z.enum(['HR', 'MANAGER', 'EMPLOYEE', 'INTERN']),
      roleId: z.string().min(1).optional(),
      status: z.enum(['ACTIVE', 'LOCKED', 'DISABLED']).default('ACTIVE')
    })
  }),
  update: z.object({
    body: z.object({
      email: z.string().email().optional(),
      password: z.string().min(8).optional(),
      panel: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']).optional(),
      role: z.enum(['HR', 'MANAGER', 'EMPLOYEE', 'INTERN']).optional(),
      roleId: z.string().min(1).optional(),
      status: z.enum(['ACTIVE', 'LOCKED', 'DISABLED']).optional()
    })
  })
};

function clean(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function roleSlug(role: string, panel: string) {
  return `${clean(panel)}-${clean(role)}`;
}

function makeTemporaryPassword() {
  return `Cm@${crypto.randomBytes(5).toString('base64url')}`;
}

async function makeCompanyEmail(tenantId: string, firstName: string, lastName: string, designation: string) {
  const base = `${clean(firstName)}${clean(lastName)}${clean(designation)}` || `user${Date.now()}`;
  let candidate = `${base}@${COMPANY_DOMAIN}`;
  let suffix = 2;

  while (await User.exists({ tenantId, email: candidate, isDeleted: false })) {
    candidate = `${base}${suffix}@${COMPANY_DOMAIN}`;
    suffix += 1;
  }

  return candidate;
}

function publicUser(user: Record<string, unknown>) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export const listUsersController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const query: Record<string, unknown> = { tenantId: req.user!.tenantId, isDeleted: false };
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) query.email = { $regex: String(req.query.search), $options: 'i' };

  const [users, total] = await Promise.all([
    User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query)
  ]);

  res.json({ success: true, data: users, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const createUserController = asyncHandler(async (req: AuthRequest, res: Response) => {
  let role = req.body.roleId
    ? await Role.findOne({ _id: req.body.roleId, tenantId: req.user!.tenantId, isDeleted: false })
    : await Role.findOne({ tenantId: req.user!.tenantId, code: req.body.role, isDeleted: false });

  if (!role) {
    role = await Role.create({
      tenantId: req.user!.tenantId,
      name: req.body.role,
      code: req.body.role,
      slug: roleSlug(req.body.role, req.body.panel),
      panel: req.body.panel,
      permissions: ['department:read', 'employee:read', 'project:read', 'task:read', 'notification:read'],
      isDeleted: false
    });
  }

  const email = await makeCompanyEmail(req.user!.tenantId, req.body.firstName, req.body.lastName, req.body.designation);
  const temporaryPassword = makeTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const user = await User.create({
    tenantId: req.user!.tenantId,
    email,
    passwordHash,
    panel: req.body.panel,
    role: req.body.role,
    roleId: role._id,
    status: req.body.status
  });

  res.status(201).json({
    success: true,
    data: {
      ...publicUser(user.toObject()),
      generatedCredentials: { email, temporaryPassword }
    }
  });
});

export const updateUserController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const update: Record<string, unknown> = { ...req.body };
  if (req.body.password) {
    update.passwordHash = await bcrypt.hash(req.body.password, 12);
    update.tokenVersion = Date.now();
    delete update.password;
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user!.tenantId, isDeleted: false },
    update,
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

export const deleteUserController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user!.tenantId, isDeleted: false },
    { isDeleted: true, status: 'DISABLED' },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: { id: req.params.id } });
});

