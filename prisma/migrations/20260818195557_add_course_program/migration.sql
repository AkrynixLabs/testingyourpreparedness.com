-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "programId" TEXT;

-- CreateIndex
CREATE INDEX "Course_programId_idx" ON "Course"("programId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

