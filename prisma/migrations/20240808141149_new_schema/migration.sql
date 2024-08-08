-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MEDIA', 'EVENT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverPhoto" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "duration" BIGINT NOT NULL,
    "type" "MediaType" NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

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
    "thumbnail" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
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
    "mediaId" TEXT,
    "specialKey" TEXT NOT NULL,
    "notificationId" INTEGER NOT NULL,

    CONSTRAINT "engagementsManager_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Media_uniqueId_key" ON "Media"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_uniqueId_key" ON "Event"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_eventId_key" ON "engagementsManager"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_mediaId_key" ON "engagementsManager"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_specialKey_key" ON "engagementsManager"("specialKey");

-- CreateIndex
CREATE UNIQUE INDEX "engagementsManager_notificationId_key" ON "engagementsManager"("notificationId");

-- AddForeignKey
ALTER TABLE "engagementsManager" ADD CONSTRAINT "engagementsManager_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementsManager" ADD CONSTRAINT "engagementsManager_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("uniqueId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementsManager" ADD CONSTRAINT "engagementsManager_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("uniqueId") ON DELETE SET NULL ON UPDATE CASCADE;
