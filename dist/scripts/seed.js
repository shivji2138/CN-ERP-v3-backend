import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.js';
import { connectRedis, redis } from '../config/redis.js';
import { Tenant } from '../modules/tenant/tenant.model.js';
import { Role } from '../modules/role/role.model.js';
import { User } from '../modules/user/user.model.js';
async function seed() {
    await connectDatabase();
    await connectRedis();
    const tenant = await Tenant.findOneAndUpdate({ slug: 'cybernaut-minutos' }, { name: 'Cybernaut Minutos', slug: 'cybernaut-minutos', status: 'ACTIVE' }, { upsert: true, new: true });
    const superRole = await Role.findOneAndUpdate({ tenantId: tenant._id, code: 'SUPER_ADMIN' }, { tenantId: tenant._id, name: 'Super Admin', code: 'SUPER_ADMIN', panel: 'SUPER_ADMIN', permissions: ['*'] }, { upsert: true, new: true });
    await User.findOneAndUpdate({ tenantId: tenant._id, email: 'superadmin@cybernautminutos.com' }, {
        tenantId: tenant._id,
        email: 'superadmin@cybernautminutos.com',
        passwordHash: await bcrypt.hash('ChangeMe123!', 12),
        panel: 'SUPER_ADMIN',
        role: 'HR',
        roleId: superRole._id,
        status: 'ACTIVE'
    }, { upsert: true });
    await redis.quit();
    process.exit(0);
}
seed();
