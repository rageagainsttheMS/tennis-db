/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tourneyid` on the `Match` table. All the data in the column will be lost.
  - Added the required column `tourney_id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
DROP COLUMN "tourneyid",
ADD COLUMN     "tourney_id" TEXT NOT NULL,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("tourney_id", "match_num");
