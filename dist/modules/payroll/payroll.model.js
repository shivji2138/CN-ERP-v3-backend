import { model, Schema } from 'mongoose';
import { tenantBaseSchema } from '../shared/base.schema.js';
const salaryStructureSchema = tenantBaseSchema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    basic: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    effectiveFrom: { type: Date, required: true }
});
const salarySlipSchema = tenantBaseSchema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    grossSalary: { type: Number, required: true },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    generatedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date, default: Date.now }
});
salarySlipSchema.index({ tenantId: 1, employeeId: 1, month: 1, year: 1 }, { unique: true });
export const SalaryStructure = model('SalaryStructure', salaryStructureSchema);
export const SalarySlip = model('SalarySlip', salarySlipSchema);
