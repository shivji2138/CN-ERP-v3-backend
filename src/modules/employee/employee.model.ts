import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';

const employeeSchema = tenantBaseSchema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  employeeId: { type: String, uppercase: true, trim: true, index: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: String,
  avatarUrl: String,
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
  employmentType: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'EXITED'], default: 'ACTIVE', index: true },
  salaryStructureId: { type: Schema.Types.ObjectId, ref: 'SalaryStructure' }
});

employeeSchema.index({ tenantId: 1, employeeCode: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
employeeSchema.index({ tenantId: 1, firstName: 'text', lastName: 'text', employeeCode: 'text', designation: 'text' });
employeeSchema.index({ tenantId: 1, departmentId: 1, status: 1 });

export const Employee = model('Employee', employeeSchema);
