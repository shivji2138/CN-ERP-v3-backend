import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';
const userSchema = tenantBaseSchema({
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    panel: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], default: 'USER', index: true },
    role: { type: String, enum: ['HR', 'MANAGER', 'EMPLOYEE', 'INTERN'], required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: Date,
    status: { type: String, enum: ['ACTIVE', 'LOCKED', 'DISABLED'], default: 'ACTIVE', index: true }
});
userSchema.index({ tenantId: 1, email: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
export const User = model('User', userSchema);
