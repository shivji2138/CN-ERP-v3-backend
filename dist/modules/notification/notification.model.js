import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';
const notificationSchema = tenantBaseSchema({
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    channel: { type: String, enum: ['IN_APP', 'EMAIL'], default: 'IN_APP' },
    readAt: Date
});
notificationSchema.index({ tenantId: 1, recipientId: 1, createdAt: -1 });
export const Notification = model('Notification', notificationSchema);
