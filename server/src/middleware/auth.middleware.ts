import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No access token' });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string };
    (req as Request & { userId: string }).userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}
