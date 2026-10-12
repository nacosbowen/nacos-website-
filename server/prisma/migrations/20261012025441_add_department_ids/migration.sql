-- AlterTable
ALTER TABLE "PastQuestion" ADD COLUMN     "departmentIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
