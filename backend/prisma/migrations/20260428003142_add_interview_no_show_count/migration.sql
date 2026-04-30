-- DropIndex
DROP INDEX "Application_candidateCVId_idx";

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "noShowCount" INTEGER NOT NULL DEFAULT 0;
