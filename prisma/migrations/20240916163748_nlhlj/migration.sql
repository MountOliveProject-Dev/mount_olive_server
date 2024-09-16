/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "host" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Media_fileId_key" ON "Media"("fileId");
