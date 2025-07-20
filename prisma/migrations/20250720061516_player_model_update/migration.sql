/*
  Warnings:

  - A unique constraint covering the columns `[playerMatchId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthPlace` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerMatchId` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turnedPro` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "birthPlace" TEXT NOT NULL,
ADD COLUMN     "playerMatchId" TEXT NOT NULL,
ADD COLUMN     "turnedPro" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_playerMatchId_key" ON "Player"("playerMatchId");
