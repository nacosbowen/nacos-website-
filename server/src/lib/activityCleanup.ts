import { prisma } from './prisma';

const RETENTION_DAYS = 7;

// Deletes activity logs older than 7 days. Never throws, so a failed
// cleanup can't break the request or crash the server.
export async function purgeOldActivityLogs(): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const { count } = await prisma.activityLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) console.log(`Activity log cleanup: removed ${count} entries older than ${RETENTION_DAYS} days`);
    return count;
  } catch (err) {
    console.error('Activity log cleanup failed:', err);
    return 0;
  }
}