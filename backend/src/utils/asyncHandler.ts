import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch promise rejections
 * Eliminates the need for try-catch blocks in controllers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;