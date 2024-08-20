/*
  Warnings:

  - The values [MEDIA] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category` on the `Media` table. All the data in the column will be lost.
  - Made the column `title` on table `Media` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Media` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('VIDEO', 'AUDIO', 'EVENT');
ALTER TABLE "engagementsManager" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "category",
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
