import { prisma } from './prisma';

const ROLE_PRIORITY = ['admin', 'executive', 'course_rep'];

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  details?: string,
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return;

    const names: string[] = user.roles.map((ur) => ur.role.name);
    const userRole = ROLE_PRIORITY.find((r) => names.includes(r));
    if (!userRole) return;

    await prisma.activityLog.create({
      data: {
        userId,
        userName: user.fullName,
        userRole,
        action,
        entityType,
        details: details ?? null,
      },
    });
  } catch (err) {
    console.error('logActivity failed:', err);
  }
}