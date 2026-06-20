import type { Response } from 'express';
import { Department } from '../department/department.model.js';
import { Employee } from '../employee/employee.model.js';
import { Project } from '../project/project.model.js';
import { Leave } from '../leave/leave.model.js';
import { User } from '../user/user.model.js';
import type { AuthRequest } from '../../types/auth.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { redis } from '../../config/redis.js';

export const dashboardController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId;
  const cacheKey = `dashboard:${tenantId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const [employeeCount, departmentCount, activeProjects, pendingLeaves, internCount, userCount, taskByStatus] = await Promise.all([
    Employee.countDocuments({ tenantId, isDeleted: false, status: { $ne: 'EXITED' } }),
    Department.countDocuments({ tenantId, isDeleted: false, status: 'ACTIVE' }),
    Project.countDocuments({ tenantId, isDeleted: false, status: 'ACTIVE' }),
    Leave.countDocuments({ tenantId, isDeleted: false, status: 'PENDING' }),
    Employee.countDocuments({ tenantId, isDeleted: false, employmentType: 'INTERN' }),
    User.countDocuments({ tenantId, isDeleted: false, status: { $ne: 'DISABLED' } }),
    Project.aggregate([
      { $match: { tenantId: req.user!.tenantId, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const data = { employeeCount, departmentCount, activeProjects, pendingLeaves, internCount, userCount, taskByStatus };
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 60);
  res.json({ success: true, data });
});

