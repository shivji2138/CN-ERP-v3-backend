import { Schema } from 'mongoose';

export function tenantBaseSchema(definition: Record<string, unknown>) {
  return new Schema(
    {
      tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
      ...definition,
      isDeleted: { type: Boolean, default: false, index: true }
    },
    { timestamps: true }
  );
}
