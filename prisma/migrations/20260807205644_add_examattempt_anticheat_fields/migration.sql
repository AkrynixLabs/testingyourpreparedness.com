-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN     "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tabSwitchCount" INTEGER NOT NULL DEFAULT 0;

