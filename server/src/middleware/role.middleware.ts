import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { RoleName } from '@prisma/client';

export function requireRole(...roles: RoleName[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user) return res.status(401).json({ message: 'User not found' });

    const userRoles = user.roles.map((ur) => ur.role.name);
    const hasRole = roles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }

    next();
  };
}
