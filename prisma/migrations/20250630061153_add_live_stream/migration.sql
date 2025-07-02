-- CreateTable
CREATE TABLE `live_streams` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `streamName` VARCHAR(191) NOT NULL,
    `streamType` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `resolution` VARCHAR(191) NOT NULL,
    `bitrate` INTEGER NOT NULL,
    `frameRate` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `live_streams_userId_streamName_key`(`userId`, `streamName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `live_streams` ADD CONSTRAINT `live_streams_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
