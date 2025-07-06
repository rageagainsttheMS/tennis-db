-- CreateEnum
CREATE TYPE "Hand" AS ENUM ('LEFT', 'RIGHT');

-- CreateEnum
CREATE TYPE "Backhand" AS ENUM ('TWOHANDED', 'ONEHANDED');

-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('GS', 'ATPM1000', 'ATP500', 'ATP250', 'DavisCup', 'LaverCup');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hand" "Hand" NOT NULL,
    "backHand" "Backhand" NOT NULL,
    "country" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "profile" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tournamentType" "TournamentType" NOT NULL,
    "image" TEXT NOT NULL,
    "drawSize" INTEGER NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);
