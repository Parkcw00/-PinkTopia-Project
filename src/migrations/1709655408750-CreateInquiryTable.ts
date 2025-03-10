import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInquiryTable1709655408750 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`inquiry\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`type\` enum('refund','payment','bug','suggestion','other') NOT NULL DEFAULT 'other',
                \`title\` varchar(255) NOT NULL,
                \`content\` text NOT NULL,
                \`order_number\` varchar(255) NULL,
                \`payment_date\` datetime NULL,
                \`attachment_url\` varchar(255) NULL,
                \`status\` enum('pending','completed') NOT NULL DEFAULT 'pending',
                \`answer\` text NULL,
                \`answered_at\` datetime NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`user_id\` int NOT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`FK_inquiry_user\` (\`user_id\`),
                CONSTRAINT \`FK_inquiry_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`inquiry\``);
    }

}
