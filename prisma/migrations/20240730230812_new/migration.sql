/*
  Warnings:

  - A unique constraint covering the columns `[notificationId]` on the table `notificationEngagements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venue` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `host` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL,
ADD COLUMN     "venue" TEXT NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "host" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "notificationEngagements_notificationId_key" ON "notificationEngagements"("notificationId");
