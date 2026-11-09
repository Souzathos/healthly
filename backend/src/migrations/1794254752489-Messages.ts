import { MigrationInterface, QueryRunner } from "typeorm";

export class Messages1794254752489 implements MigrationInterface {
    name = 'Messages1794254752489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`conversations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`lastMessageAt\` datetime(6) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userAId\` int NULL, \`userBId\` int NULL, UNIQUE INDEX \`IDX_5ec3502739d8013a8afc4525cb\` (\`userAId\`, \`userBId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`messages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`text\` varchar(1000) NOT NULL, \`readAt\` datetime(6) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`conversationId\` int NULL, \`senderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_1b9a6965f56e4f85fb13157d88f\` FOREIGN KEY (\`userAId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_fa4bcad772be3989d9320d9f7cb\` FOREIGN KEY (\`userBId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_e5663ce0c730b2de83445e2fd19\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_2db9cf2b3ca111742793f6c37ce\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_2db9cf2b3ca111742793f6c37ce\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_e5663ce0c730b2de83445e2fd19\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_fa4bcad772be3989d9320d9f7cb\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_1b9a6965f56e4f85fb13157d88f\``);
        await queryRunner.query(`DROP TABLE \`messages\``);
        await queryRunner.query(`DROP INDEX \`IDX_5ec3502739d8013a8afc4525cb\` ON \`conversations\``);
        await queryRunner.query(`DROP TABLE \`conversations\``);
    }

}
