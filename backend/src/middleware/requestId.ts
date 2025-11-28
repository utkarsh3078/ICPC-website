import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Adds a unique request ID to each request for tracing
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.headers['x-request-id'] as string || randomUUID();
  
  // Attach to request
  (req as any).id = id;
  
  // Add to response headers
  res.setHeader('X-Request-Id', id);
  
  next();
};

export default requestId;