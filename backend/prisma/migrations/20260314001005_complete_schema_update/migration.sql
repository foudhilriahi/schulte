/*
  Warnings:

  - The values [active,draft] on the enum `OfferStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Application` table. All the data in the column will be lost.
  - The `aiAnalysis` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `date` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `prepNotes` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `JobOffer` table. All the data in the column will be lost.
  - You are about to drop the column `openPositions` on the `JobOffer` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `JobOffer` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `OfferTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `OfferTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledAt` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `JobOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `site` to the `JobOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payload` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `OfferTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleEn` to the `OfferTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleFr` to the `OfferTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InterviewOutcome" AS ENUM ('pass', 'fail', 'no_show');

-- AlterEnum
ALTER TYPE "ContractType" ADD VALUE 'Alternance';

-- AlterEnum
BEGIN;
CREATE TYPE "OfferStatus_new" AS ENUM ('open', 'paused', 'closed');
ALTER TABLE "public"."JobOffer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "JobOffer" ALTER COLUMN "status" TYPE "OfferStatus_new" USING ("status"::text::"OfferStatus_new");
ALTER TYPE "OfferStatus" RENAME TO "OfferStatus_old";
ALTER TYPE "OfferStatus_new" RENAME TO "OfferStatus";
DROP TYPE "public"."OfferStatus_old";
ALTER TABLE "JobOffer" ALTER COLUMN "status" SET DEFAULT 'open';
COMMIT;

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "createdAt",
ADD COLUMN     "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "coverNote" TEXT,
ADD COLUMN     "cvTemplate" TEXT,
ADD COLUMN     "hrRating" INTEGER,
ADD COLUMN     "hrTags" TEXT[],
DROP COLUMN "aiAnalysis",
ADD COLUMN     "aiAnalysis" JSONB;

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "date",
DROP COLUMN "notes",
DROP COLUMN "prepNotes",
DROP COLUMN "status",
DROP COLUMN "time",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "notesForCandidate" TEXT,
ADD COLUMN     "outcome" "InterviewOutcome",
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "city",
DROP COLUMN "openPositions",
DROP COLUMN "requirements",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "experienceYears" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requiredSkills" TEXT[],
ADD COLUMN     "salaryRange" TEXT,
ADD COLUMN     "seats" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "showSalary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "site" "Site" NOT NULL,
ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'open';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "link",
DROP COLUMN "message",
DROP COLUMN "read",
DROP COLUMN "title",
ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payload" JSONB NOT NULL,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OfferTemplate" DROP COLUMN "requirements",
DROP COLUMN "title",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "suggestedSkills" TEXT[],
ADD COLUMN     "titleEn" TEXT NOT NULL,
ADD COLUMN     "titleFr" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OfferTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferTemplate" ADD CONSTRAINT "OfferTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
