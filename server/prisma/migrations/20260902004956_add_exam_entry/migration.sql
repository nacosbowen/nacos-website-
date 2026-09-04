-- CreateTable
CREATE TABLE "ExamEntry" (
    "id" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "venue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExamEntry" ADD CONSTRAINT "ExamEntry_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
