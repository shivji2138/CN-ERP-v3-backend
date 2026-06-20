import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';
const taskSchema = tenantBaseSchema({
    title: { type: String, required: true, trim: true },
    description: String,
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM', index: true },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'], default: 'PENDING', index: true },
    dueDate: { type: Date, required: true, index: true },
    completedAt: Date
});
taskSchema.index({ tenantId: 1, status: 1, dueDate: 1 });
taskSchema.index({ tenantId: 1, title: 'text', description: 'text' });
export const Task = model('Task', taskSchema);
