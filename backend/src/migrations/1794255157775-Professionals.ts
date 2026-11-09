import { MigrationInterface, QueryRunner } from "typeorm";

export class Professionals1794255157775 implements MigrationInterface {
    name = 'Professionals1794255157775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`professional_requests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(30) NOT NULL, \`registryNumber\` varchar(30) NOT NULL, \`document\` longblob NOT NULL, \`documentMimeType\` varchar(100) NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`reviewedAt\` datetime(6) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`reviewedById\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role\` varchar(20) NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isVerified\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`professionalType\` varchar(30) NULL`);
        await queryRunner.query(`ALTER TABLE \`professional_requests\` ADD CONSTRAINT \`FK_7bf3931fb93e5ed3e0652ddef6d\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`professional_requests\` ADD CONSTRAINT \`FK_bee4640b82b6d8423a887341269\` FOREIGN KEY (\`reviewedById\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`professional_requests\` DROP FOREIGN KEY \`FK_bee4640b82b6d8423a887341269\``);
        await queryRunner.query(`ALTER TABLE \`professional_requests\` DROP FOREIGN KEY \`FK_7bf3931fb93e5ed3e0652ddef6d\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`professionalType\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isVerified\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
        await queryRunner.query(`DROP TABLE \`professional_requests\``);
    }

}
