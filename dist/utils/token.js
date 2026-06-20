import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function signAccessToken(payload) {
    const options = { expiresIn: env.JWT_ACCESS_EXPIRES_IN, subject: payload.sub };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        ...options
    });
}
export function signRefreshToken(payload) {
    const options = { expiresIn: env.JWT_REFRESH_EXPIRES_IN, subject: payload.sub };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        ...options
    });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
