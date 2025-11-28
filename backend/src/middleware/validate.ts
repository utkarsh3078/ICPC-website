import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/AppError';

/**
 * Middleware to check results of express-validator chains.
 * Usage: add validator chains on route, then `validate` to short-circuit on errors.
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new ValidationError(message));
  }
  return next();
};

export default validate;
