import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';

const announcementSchema = tenantBaseSchema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  scope: { type: String, enum: ['COMPANY', 'DEPARTMENT'], default: 'COMPANY', index: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
  publishedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: { type: Date, default: Date.now, index: true }
});

announcementSchema.index({ tenantId: 1, publishedAt: -1 });

export const Announcement = model('Announcement', announcementSchema);
