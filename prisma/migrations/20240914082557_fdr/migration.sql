/*
  Warnings:

  - Added the required column `thumbnailStatus` to the `engagementsManager` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "engagementsManager" ADD COLUMN     "thumbnailStatus" BOOLEAN NOT NULL;
