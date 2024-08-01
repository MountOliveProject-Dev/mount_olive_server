/*
  Warnings:

  - Added the required column `phone` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Media" ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" SET DATA TYPE TEXT;
