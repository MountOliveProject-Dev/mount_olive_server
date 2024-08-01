-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MEDIA', 'EVENT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "UserMediaEngagement" (
    "userId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "viewCount" BIGINT NOT NULL,
    "likeCount" BIGINT NOT NULL,

    CONSTRAINT "UserMediaEngagement_pkey" PRIMARY KEY ("userId","mediaId")
);

-- CreateTable
CREATE TABLE "notificationEngagements" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "eventId" INTEGER,
    "mediaId" INTEGER,
    "specialKey" TEXT NOT NULL,
    "notificationId" INTEGER NOT NULL,

    CONSTRAINT "notificationEngagements_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileId_key" ON "User"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_uniqueId_key" ON "Event"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_uniqueId_key" ON "Media"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "notificationEngagements_specialKey_key" ON "notificationEngagements"("specialKey");

-- CreateIndex
CREATE UNIQUE INDEX "notificationEngagements_notificationId_key" ON "notificationEngagements"("notificationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaEngagement" ADD CONSTRAINT "UserMediaEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaEngagement" ADD CONSTRAINT "UserMediaEngagement_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationEngagements" ADD CONSTRAINT "notificationEngagements_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationEngagements" ADD CONSTRAINT "notificationEngagements_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationEngagements" ADD CONSTRAINT "notificationEngagements_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
