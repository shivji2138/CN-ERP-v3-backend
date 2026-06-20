import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';
const departmentSchema = tenantBaseSchema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: String,
    headId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true }
});
departmentSchema.index({ tenantId: 1, code: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
departmentSchema.index({ tenantId: 1, name: 'text', code: 'text' });
export const Department = model('Department', departmentSchema);
