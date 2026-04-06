-- DropIndex
DROP INDEX "Application_candidateCVId_idx";

-- AlterTable
ALTER TABLE "CandidateCV" ALTER COLUMN "cvText" DROP DEFAULT;
