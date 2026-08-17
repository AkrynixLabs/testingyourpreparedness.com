-- CreateEnum
CREATE TYPE "VideoSource" AS ENUM ('external', 'mux');

-- CreateEnum
CREATE TYPE "MuxAssetStatus" AS ENUM ('preparing', 'ready', 'errored');

-- CreateEnum
CREATE TYPE "VirtualSessionMode" AS ENUM ('daily', 'external_link');

-- CreateEnum
CREATE TYPE "VirtualSessionStatus" AS ENUM ('scheduled', 'live', 'ended', 'cancelled');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "muxAssetId" TEXT,
ADD COLUMN     "muxPlaybackId" TEXT,
ADD COLUMN     "muxStatus" "MuxAssetStatus",
ADD COLUMN     "muxUploadId" TEXT,
ADD COLUMN     "videoSource" "VideoSource";

-- CreateTable
CREATE TABLE "VirtualSession" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "mode" "VirtualSessionMode" NOT NULL,
    "dailyRoomName" TEXT,
    "dailyRoomUrl" TEXT,
    "externalMeetingUrl" TEXT,
    "status" "VirtualSessionStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualSession_dailyRoomName_key" ON "VirtualSession"("dailyRoomName");

-- CreateIndex
CREATE INDEX "VirtualSession_courseId_idx" ON "VirtualSession"("courseId");

-- CreateIndex
CREATE INDEX "VirtualSession_scheduledAt_idx" ON "VirtualSession"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_muxUploadId_key" ON "Lesson"("muxUploadId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_muxAssetId_key" ON "Lesson"("muxAssetId");

-- AddForeignKey
ALTER TABLE "VirtualSession" ADD CONSTRAINT "VirtualSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

