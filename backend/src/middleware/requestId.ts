import { Request, Response, NextFunction } from 'express';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers['x-request-id'] as string) || (globalThis as any).crypto?.randomUUID?.() || String(Date.now());
  res.setHeader('X-Request-Id', id);
  // attach to res.locals for handlers/logging
  res.locals.requestId = id;
  next();
};

export default requestId;
