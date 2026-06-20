import { z } from 'zod';
import { ApiError } from '../../utils/api-error.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getPagination } from '../../utils/pagination.js';
const idParams = z.object({ params: z.object({ id: z.string().min(1) }) });
export const schemas = { idParams };
export function createCrudController(model, options = {}) {
    const list = asyncHandler(async (req, res) => {
        const { page, limit, skip } = getPagination(req);
        const query = { tenantId: req.user.tenantId, isDeleted: false };
        if (req.query.status)
            query.status = req.query.status;
        if (req.query.departmentId)
            query.departmentId = req.query.departmentId;
        if (req.query.projectId)
            query.projectId = req.query.projectId;
        if (req.query.search && options.searchFields?.length) {
            query.$text = { $search: String(req.query.search) };
        }
        const [items, total] = await Promise.all([
            model.find(query).sort(options.defaultSort ?? { createdAt: -1 }).skip(skip).limit(limit).lean(),
            model.countDocuments(query)
        ]);
        res.json({ success: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    });
    const getById = asyncHandler(async (req, res) => {
        const item = await model.findOne({ _id: req.params.id, tenantId: req.user.tenantId, isDeleted: false }).lean();
        if (!item)
            throw new ApiError(404, `${model.modelName} not found`);
        res.json({ success: true, data: item });
    });
    const create = asyncHandler(async (req, res) => {
        const item = await model.create({ ...req.body, tenantId: req.user.tenantId });
        res.status(201).json({ success: true, data: item });
    });
    const update = asyncHandler(async (req, res) => {
        const item = await model.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId, isDeleted: false }, req.body, { new: true, runValidators: true });
        if (!item)
            throw new ApiError(404, `${model.modelName} not found`);
        res.json({ success: true, data: item });
    });
    const remove = asyncHandler(async (req, res) => {
        const item = await model.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!item)
            throw new ApiError(404, `${model.modelName} not found`);
        res.json({ success: true, data: { id: req.params.id } });
    });
    return { list, getById, create, update, remove };
}
