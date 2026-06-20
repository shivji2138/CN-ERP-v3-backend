import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';

const leaveSchema = tenantBaseSchema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  type: { type: String, enum: ['CASUAL', 'SICK', 'EARNED', 'UNPAID'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
  reviewedById: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  reviewNote: String
});

leaveSchema.index({ tenantId: 1, status: 1, startDate: 1 });

export const Leave = model('Leave', leaveSchema);
