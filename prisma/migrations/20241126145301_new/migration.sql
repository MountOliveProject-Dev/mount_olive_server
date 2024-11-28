-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('Info', 'Warning', 'Error');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('Create', 'Update', 'Delete', 'Read');

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "requestType" "RequestType" NOT NULL,
    "type" "LogType" NOT NULL,
    "detail" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
