import { model } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';
const roleSchema = tenantBaseSchema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    panel: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], required: true },
    permissions: [{ type: String, required: true }]
});
roleSchema.index({ tenantId: 1, code: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
export const Role = model('Role', roleSchema);
