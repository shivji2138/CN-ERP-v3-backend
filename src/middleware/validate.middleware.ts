import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';
import { ApiError } from '../utils/api-error.js';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    if (!parsed.success) return next(new ApiError(422, 'Validation failed', parsed.error.flatten()));
    req.body = parsed.data.body ?? req.body;
    req.query = parsed.data.query ?? req.query;
    req.params = parsed.data.params ?? req.params;
    return next();
  };
}
