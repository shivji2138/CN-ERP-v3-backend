import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';

const ticketSchema = tenantBaseSchema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  raisedById: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedToId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM', index: true },
  status: { type: String, enum: ['OPEN', 'ASSIGNED', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true },
  resolvedAt: Date
});

ticketSchema.index({ tenantId: 1, status: 1, priority: 1 });
ticketSchema.index({ tenantId: 1, subject: 'text', description: 'text' });

export const Ticket = model('Ticket', ticketSchema);
