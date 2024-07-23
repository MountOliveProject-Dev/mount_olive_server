/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - The required column `uniqueId` was added to the `Media` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `type` on the `Media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MEDIA', 'EVENT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'AUDIO');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "likeCount",
DROP COLUMN "viewCount",
ADD COLUMN     "uniqueId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "MediaType" NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "phone";

-- CreateTable
CREATE TABLE "UserMediaEngagement" (
    "userId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "viewCount" BIGINT NOT NULL,
    "likeCount" BIGINT NOT NULL,

    CONSTRAINT "UserMediaEngagement_pkey" PRIMARY KEY ("userId","mediaId")
);

-- CreateTable
CREATE TABLE "notificationEngagements" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "eventId" INTEGER,
    "mediaId" INTEGER,
    "specialKey" TEXT NOT NULL,
    "notificationId" INTEGER NOT NULL,

    CONSTRAINT "notificationEngagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaStorageToken" (
    "id" SERIAL NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "expiryDate" INTEGER NOT NULL,

    CONSTRAINT "MediaStorageToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notificationEngagements_specialKey_key" ON "notificationEngagements"("specialKey");

-- CreateIndex
CREATE UNIQUE INDEX "Media_uniqueId_key" ON "Media"("uniqueId");

-- AddForeignKey
ALTER TABLE "UserMediaEngagement" ADD CONSTRAINT "UserMediaEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaEngagement" ADD CONSTRAINT "UserMediaEngagement_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationEngagements" ADD CONSTRAINT "notificationEngagements_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationEngagements" ADD CONSTRAINT "notificationEngagements_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationEngagements" ADD CONSTRAINT "notificationEngagements_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
