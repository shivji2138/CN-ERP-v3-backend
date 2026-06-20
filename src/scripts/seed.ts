import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.js';
import { connectRedis, redis } from '../config/redis.js';
import { Tenant } from '../modules/tenant/tenant.model.js';
import { Role } from '../modules/role/role.model.js';
import { User } from '../modules/user/user.model.js';

async function seed() {
  await connectDatabase();
  await connectRedis();

  const tenant = await Tenant.findOneAndUpdate(
    { slug: 'cybernaut-minutos' },
    { name: 'Cybernaut Minutos', slug: 'cybernaut-minutos', status: 'ACTIVE' },
    { upsert: true, new: true }
  );

  const existingSuperRole = await Role.findOne({ $or: [{ tenantId: tenant._id, code: 'SUPER_ADMIN' }, { name: 'Super Admin' }] });
  const superRole =
    existingSuperRole ??
    new Role({
      tenantId: tenant._id,
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      panel: 'SUPER_ADMIN',
      permissions: ['*'],
      isDeleted: false
    });

  superRole.set({
    tenantId: tenant._id,
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    slug: 'super-admin',
    panel: 'SUPER_ADMIN',
    permissions: ['*'],
    isDeleted: false
  });
  await superRole.save();

  await User.findOneAndUpdate(
    { tenantId: tenant._id, email: 'superadmin@cybernautminutos.com' },
    {
      tenantId: tenant._id,
      email: 'superadmin@cybernautminutos.com',
      passwordHash: await bcrypt.hash('ChangeMe123!', 12),
      panel: 'SUPER_ADMIN',
      role: 'HR',
      roleId: superRole._id,
      status: 'ACTIVE',
      tokenVersion: 0,
      isDeleted: false
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  await redis.quit();
  process.exit(0);
}

seed();
