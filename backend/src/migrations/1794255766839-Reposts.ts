import { MigrationInterface, QueryRunner } from "typeorm";

export class Reposts1794255766839 implements MigrationInterface {
    name = 'Reposts1794255766839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reposts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`postId\` int NULL, UNIQUE INDEX \`IDX_7bf48d7d83b681bb3cbf44f62b\` (\`userId\`, \`postId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reposts\` ADD CONSTRAINT \`FK_d8f973ec285886ab4331780d4c6\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reposts\` ADD CONSTRAINT \`FK_547e95c4a7ff1ec4a3715eec071\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reposts\` DROP FOREIGN KEY \`FK_547e95c4a7ff1ec4a3715eec071\``);
        await queryRunner.query(`ALTER TABLE \`reposts\` DROP FOREIGN KEY \`FK_d8f973ec285886ab4331780d4c6\``);
        await queryRunner.query(`DROP INDEX \`IDX_7bf48d7d83b681bb3cbf44f62b\` ON \`reposts\``);
        await queryRunner.query(`DROP TABLE \`reposts\``);
    }

}
