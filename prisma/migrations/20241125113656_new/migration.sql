-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Video', 'Audio', 'Event');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('Video', 'Audio', 'Image');

-- CreateEnum
CREATE TYPE "FolderType" AS ENUM ('Images', 'Audios');

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "duration" TEXT,
    "type" "MediaType" NOT NULL,
    "fileId" TEXT,
    "host" TEXT,
    "postedAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "folderId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagementsManager" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "eventId" TEXT,
    "eventStatus" BOOLEAN NOT NULL,
    "videoStatus" BOOLEAN NOT NULL,
    "audioStatus" BOOLEAN NOT NULL,
    "thumbnailStatus" BOOLEAN NOT NULL,
    "mediaId" TEXT,
    "specialKey" TEXT NOT NULL,
    "notificationId" INTEGER NOT NULL,

    CONSTRAINT "engagementsManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder" (
    "id" SERIAL NOT NULL,
    "folderId" TEXT NOT NULL,
    "folderType" "FolderType" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_uniqueId_key" ON "Media"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_fileId_key" ON "Media"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_uniqueId_key" ON "Event"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_eventId_key" ON "engagementsManager"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_mediaId_key" ON "engagementsManager"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_specialKey_key" ON "engagementsManager"("specialKey");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_notificationId_key" ON "engagementsManager"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "folder_folderId_key" ON "folder"("folderId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementsManager" ADD CONSTRAINT "engagementsManager_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementsManager" ADD CONSTRAINT "engagementsManager_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("uniqueId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementsManager" ADD CONSTRAINT "engagementsManager_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("uniqueId") ON DELETE SET NULL ON UPDATE CASCADE;
