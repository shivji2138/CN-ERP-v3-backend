import bcrypt from 'bcryptjs';
import { Role } from '../role/role.model.js';
import { User } from '../user/user.model.js';
import { ApiError } from '../../utils/api-error.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token.js';
import { redis } from '../../config/redis.js';
const refreshKey = (userId, tokenVersion) => `refresh:${userId}:${tokenVersion}`;
export async function login(email, password) {
    const user = (await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+passwordHash'));
    if (!user || user.status !== 'ACTIVE')
        throw new ApiError(401, 'Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
        throw new ApiError(401, 'Invalid credentials');
    const role = (await Role.findById(user.roleId).lean());
    if (!role)
        throw new ApiError(403, 'Role is not configured');
    const authPayload = {
        sub: String(user._id),
        tenantId: String(user.tenantId),
        panel: user.panel,
        role: user.role,
        permissions: role.permissions
    };
    const accessToken = signAccessToken(authPayload);
    const refreshToken = signRefreshToken({
        sub: String(user._id),
        tenantId: String(user.tenantId),
        panel: user.panel,
        role: user.role,
        tokenVersion: user.tokenVersion
    });
    await redis.set(refreshKey(String(user._id), user.tokenVersion), refreshToken, 'EX', 7 * 24 * 60 * 60);
    await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
    return { user: authPayload, accessToken, refreshToken };
}
export async function refresh(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await redis.get(refreshKey(payload.sub, payload.tokenVersion));
    if (stored !== refreshToken)
        throw new ApiError(401, 'Invalid refresh token');
    const user = (await User.findById(payload.sub));
    if (!user || user.tokenVersion !== payload.tokenVersion || user.status !== 'ACTIVE') {
        throw new ApiError(401, 'Invalid refresh token');
    }
    const role = (await Role.findById(user.roleId).lean());
    if (!role)
        throw new ApiError(403, 'Role is not configured');
    const accessPayload = {
        sub: String(user._id),
        tenantId: String(user.tenantId),
        panel: user.panel,
        role: user.role,
        permissions: role.permissions
    };
    return { accessToken: signAccessToken(accessPayload), user: accessPayload };
}
export async function logout(userId, tokenVersion) {
    await redis.del(refreshKey(userId, tokenVersion));
}
