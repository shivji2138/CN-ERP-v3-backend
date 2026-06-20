import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';
const eventSchema = tenantBaseSchema({
    title: { type: String, required: true },
    description: String,
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true },
    location: String,
    attendeeIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});
eventSchema.index({ tenantId: 1, startsAt: 1 });
export const Event = model('Event', eventSchema);
