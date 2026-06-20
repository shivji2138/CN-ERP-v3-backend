import { ApiError } from '../utils/api-error.js';
import { verifyAccessToken } from '../utils/token.js';
export function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : cookieToken;
    if (!token)
        return next(new ApiError(401, 'Authentication required'));
    try {
        req.user = verifyAccessToken(token);
        return next();
    }
    catch {
        return next(new ApiError(401, 'Invalid or expired token'));
    }
}
