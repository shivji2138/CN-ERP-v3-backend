import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';

const attachmentSchema = new Schema(
  {
    name: String,
    url: String,
    mimeType: String,
    size: Number
  },
  { _id: false }
);

const discussionSchema = tenantBaseSchema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  attachments: [attachmentSchema]
});

discussionSchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });

export const Discussion = model('Discussion', discussionSchema);
