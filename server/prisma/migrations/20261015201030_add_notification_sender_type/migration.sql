-- CreateEnum
CREATE TYPE "NotificationSender" AS ENUM ('executive', 'course_rep');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "senderType" "NotificationSender" NOT NULL DEFAULT 'executive';
