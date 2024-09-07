-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_folderId_fkey";

-- AlterTable
ALTER TABLE "Media" ALTER COLUMN "folderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
