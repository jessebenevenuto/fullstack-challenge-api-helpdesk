-- AlterTable
ALTER TABLE "users" ALTER COLUMN "last_assigned_at" DROP NOT NULL,
ALTER COLUMN "last_assigned_at" DROP DEFAULT;
