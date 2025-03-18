-- AlterTable
ALTER TABLE `task` ADD COLUMN `created_at` TIMESTAMP(0) NULL,
    ADD COLUMN `deleted_at` TIMESTAMP(0) NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL;
