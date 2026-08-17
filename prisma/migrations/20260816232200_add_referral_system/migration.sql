-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredByStudentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_referralCode_key" ON "Student"("referralCode");

-- CreateIndex
CREATE INDEX "Student_referredByStudentId_idx" ON "Student"("referredByStudentId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_referredByStudentId_fkey" FOREIGN KEY ("referredByStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

