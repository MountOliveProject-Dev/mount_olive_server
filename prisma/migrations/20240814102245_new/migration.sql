/*
  Warnings:

  - You are about to drop the column `coverPhoto` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `host` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Media` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "coverPhoto",
DROP COLUMN "host",
DROP COLUMN "source",
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
