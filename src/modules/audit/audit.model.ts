import { model, Schema } from 'mongoose';

const auditLogSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: String,
    ipAddress: String,
    userAgent: String,
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });

export const AuditLog = model('AuditLog', auditLogSchema);
