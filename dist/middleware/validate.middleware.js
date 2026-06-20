import { ApiError } from '../utils/api-error.js';
export function validate(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        if (!parsed.success)
            return next(new ApiError(422, 'Validation failed', parsed.error.flatten()));
        req.body = parsed.data.body ?? req.body;
        req.query = parsed.data.query ?? req.query;
        req.params = parsed.data.params ?? req.params;
        return next();
    };
}
