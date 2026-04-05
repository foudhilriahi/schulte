-- CreateTable
CREATE TABLE "CandidateCV" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "cvUrl" TEXT,
    "formData" JSONB,
    "cvTemplate" TEXT,
    "size" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateCV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateCV_candidateId_createdAt_idx" ON "CandidateCV"("candidateId", "createdAt");

-- AddForeignKey
ALTER TABLE "CandidateCV" ADD CONSTRAINT "CandidateCV_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
