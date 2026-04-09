/*
  Warnings:

  - Added the required column `minutes` to the `Time` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Time" ADD COLUMN     "minutes" INTEGER NOT NULL;
