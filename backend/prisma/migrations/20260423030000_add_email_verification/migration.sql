-- Add email verification fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyTokenExpiry" TIMESTAMP(3);

-- Mark all existing users as already verified (no retroactive blocking)
UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" = false;
