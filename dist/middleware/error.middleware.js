import { ApiError } from '../utils/api-error.js';
import { logger } from '../config/logger.js';
export const errorMiddleware = (error, _req, res, _next) => {
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            details: error.details
        });
    }
    logger.error({ error }, 'Unhandled API error');
    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};
