import type { Request } from 'express';

export function getPagination(req: Request) {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}
