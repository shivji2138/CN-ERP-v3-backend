import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { createCrudController } from '../../modules/shared/crud.factory.js';
import { Department } from '../../modules/department/department.model.js';
import { Role } from '../../modules/role/role.model.js';
import { Employee } from '../../modules/employee/employee.model.js';
import { Project } from '../../modules/project/project.model.js';
import { Task } from '../../modules/task/task.model.js';
import { Announcement } from '../../modules/announcement/announcement.model.js';
import { Discussion } from '../../modules/discussion/discussion.model.js';
import { Leave } from '../../modules/leave/leave.model.js';
import { SalarySlip, SalaryStructure } from '../../modules/payroll/payroll.model.js';
import { Event } from '../../modules/event/event.model.js';
import { Ticket } from '../../modules/ticket/ticket.model.js';
import { Notification } from '../../modules/notification/notification.model.js';
export const crudRouter = Router();
const modules = [
    ['departments', 'department', Department],
    ['roles', 'role', Role],
    ['employees', 'employee', Employee],
    ['projects', 'project', Project],
    ['tasks', 'task', Task],
    ['announcements', 'announcement', Announcement],
    ['discussions', 'discussion', Discussion],
    ['leaves', 'leave', Leave],
    ['payroll/salary-structures', 'payroll', SalaryStructure],
    ['payroll/salary-slips', 'payroll', SalarySlip],
    ['events', 'event', Event],
    ['tickets', 'ticket', Ticket],
    ['notifications', 'notification', Notification]
];
for (const [path, resource, model] of modules) {
    const controller = createCrudController(model, { searchFields: ['name', 'title', 'subject'] });
    const router = Router();
    router.use(requireAuth);
    router.get('/', requirePermission(`${resource}:read`), controller.list);
    router.post('/', requirePermission(`${resource}:create`), controller.create);
    router.get('/:id', requirePermission(`${resource}:read`), controller.getById);
    router.patch('/:id', requirePermission(`${resource}:update`), controller.update);
    router.delete('/:id', requirePermission(`${resource}:delete`), controller.remove);
    crudRouter.use(`/${path}`, router);
}
