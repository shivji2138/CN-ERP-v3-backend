import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';

const milestoneSchema = new Schema(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    completedAt: Date,
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' }
  },
  { _id: true }
);

const projectSchema = tenantBaseSchema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  description: String,
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  memberIds: [{ type: Schema.Types.ObjectId, ref: 'Employee', index: true }],
  internIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
  progress: { type: Number, min: 0, max: 100, default: 0 },
  milestones: [milestoneSchema],
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true, index: true },
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'], default: 'PLANNED', index: true }
});

projectSchema.index({ tenantId: 1, code: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
projectSchema.index({ tenantId: 1, name: 'text', code: 'text' });
projectSchema.index({ tenantId: 1, status: 1, deadline: 1 });

export const Project = model('Project', projectSchema);
