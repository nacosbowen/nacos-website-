-- CreateTable
CREATE TABLE "DinnerInfo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'NACOS Annual Dinner',
    "date" TIMESTAMP(3),
    "time" TEXT NOT NULL DEFAULT '6:00 PM',
    "venue" TEXT NOT NULL DEFAULT 'Bowen University Recreation Center',
    "theme" TEXT NOT NULL DEFAULT 'Black & Gold',
    "dressCode" TEXT NOT NULL DEFAULT 'Black tie / formal. Gold accessories encouraged.',
    "ticketPrice" TEXT NOT NULL DEFAULT '5000',
    "highlights" TEXT NOT NULL DEFAULT 'Live performances
Award ceremony
Networking
Photo booth',
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DinnerInfo_pkey" PRIMARY KEY ("id")
);
