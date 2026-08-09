-- AlterTable
ALTER TABLE "Guardian" ADD COLUMN     "approvalToken" TEXT,
ADD COLUMN     "approvalTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_approvalToken_key" ON "Guardian"("approvalToken");

