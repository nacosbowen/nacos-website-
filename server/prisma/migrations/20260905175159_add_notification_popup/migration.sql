-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isPopup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "popupExpiresAt" TIMESTAMP(3);
