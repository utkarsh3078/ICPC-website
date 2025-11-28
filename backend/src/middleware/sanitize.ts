import { Request, Response, NextFunction } from 'express';

// Recursively trim string properties in an object
function trimStrings(obj: any): any {
  if (obj == null) return obj;
  if (typeof obj === 'string') return obj.trim();
  if (Array.isArray(obj)) return obj.map(trimStrings);
  if (typeof obj === 'object') {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      out[key] = trimStrings(obj[key]);
    }
    return out;
  }
  return obj;
}

export const sanitize = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = trimStrings(req.body);
  if (req.query) req.query = trimStrings(req.query);
  if (req.params) req.params = trimStrings(req.params);
  next();
};

export default sanitize;
