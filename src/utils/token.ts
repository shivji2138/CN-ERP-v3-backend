import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthUser } from '../types/auth.js';

export function signAccessToken(payload: AuthUser) {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    ...options
  });
}

export function signRefreshToken(payload: Pick<AuthUser, 'sub' | 'tenantId' | 'panel' | 'role'> & { tokenVersion: number }) {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    ...options
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as AuthUser;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as Pick<AuthUser, 'sub' | 'tenantId' | 'panel' | 'role'> & {
    tokenVersion: number;
  };
}
