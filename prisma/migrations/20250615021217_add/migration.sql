/*
  Warnings:

  - You are about to drop the column `tourney_id` on the `Match` table. All the data in the column will be lost.
  - Added the required column `tourneyid` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "tourney_id",
ADD COLUMN     "tourneyid" TEXT NOT NULL;
