-- Add cvText to candidate CV library
ALTER TABLE "CandidateCV"
ADD COLUMN "cvText" TEXT NOT NULL DEFAULT '';

-- Add selected CV reference and immutable snapshot field on applications
ALTER TABLE "Application"
ADD COLUMN "candidateCVId" TEXT,
ADD COLUMN "cvTextSnapshot" TEXT;

-- Backfill snapshot from legacy cvText where available
UPDATE "Application"
SET "cvTextSnapshot" = "cvText"
WHERE "cvTextSnapshot" IS NULL AND "cvText" IS NOT NULL;

-- Backfill CandidateCV.cvText for generated CVs from formData as JSON text fallback
UPDATE "CandidateCV"
SET "cvText" = COALESCE("cvText", '')
WHERE "cvText" IS NULL;

-- FK and index for selected CV reference
ALTER TABLE "Application"
ADD CONSTRAINT "Application_candidateCVId_fkey"
FOREIGN KEY ("candidateCVId") REFERENCES "CandidateCV"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Application_candidateCVId_idx" ON "Application"("candidateCVId");
