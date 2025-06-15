/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("tourneyid", "match_num");
