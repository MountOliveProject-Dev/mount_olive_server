/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Media` table. All the data in the column will be lost.
  - Added the required column `postedAt` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "createdAt",
DROP COLUMN "thumbnail",
ADD COLUMN     "postedAt" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "description" DROP NOT NULL;
