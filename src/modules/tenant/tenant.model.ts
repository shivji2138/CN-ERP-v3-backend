import { model, Schema } from 'mongoose';

const tenantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE', index: true }
  },
  { timestamps: true }
);

export const Tenant = model('Tenant', tenantSchema);
