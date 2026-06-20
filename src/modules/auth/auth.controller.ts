import type { Response } from 'express';
import { z } from 'zod';
import { env, isProduction } from '../../config/env.js';
import type { AuthRequest } from '../../types/auth.js';
import { ApiError } from '../../utils/api-error.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { login, refresh } from './auth.service.js';

export const authSchemas = {
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8)
    })
  })
};

function setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
  const common = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN
  };
  res.cookie('accessToken', accessToken, { ...common, maxAge: 15 * 60 * 1000 });
  if (refreshToken) res.cookie('refreshToken', refreshToken, { ...common, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export const loginController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await login(req.body.email, req.body.password);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, data: result });
});

export const refreshController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token required');
  const result = await refresh(token);
  setAuthCookies(res, result.accessToken);
  res.json({ success: true, data: result });
});

export const meController = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

export const logoutController = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true });
});
