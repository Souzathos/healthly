import { MigrationInterface, QueryRunner } from "typeorm";

export class Hashtags1794255471842 implements MigrationInterface {
    name = 'Hashtags1794255471842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`hashtags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7fedde18872deb14e4889361d7\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`post_hashtags\` (\`postsId\` int NOT NULL, \`hashtagsId\` int NOT NULL, INDEX \`IDX_aea7aa32b50c671eb48d7aeb82\` (\`postsId\`), INDEX \`IDX_93f4f6c26818edb5aa6b809856\` (\`hashtagsId\`), PRIMARY KEY (\`postsId\`, \`hashtagsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`diet\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`post_hashtags\` ADD CONSTRAINT \`FK_aea7aa32b50c671eb48d7aeb82b\` FOREIGN KEY (\`postsId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`post_hashtags\` ADD CONSTRAINT \`FK_93f4f6c26818edb5aa6b809856f\` FOREIGN KEY (\`hashtagsId\`) REFERENCES \`hashtags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post_hashtags\` DROP FOREIGN KEY \`FK_93f4f6c26818edb5aa6b809856f\``);
        await queryRunner.query(`ALTER TABLE \`post_hashtags\` DROP FOREIGN KEY \`FK_aea7aa32b50c671eb48d7aeb82b\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`diet\``);
        await queryRunner.query(`DROP INDEX \`IDX_93f4f6c26818edb5aa6b809856\` ON \`post_hashtags\``);
        await queryRunner.query(`DROP INDEX \`IDX_aea7aa32b50c671eb48d7aeb82\` ON \`post_hashtags\``);
        await queryRunner.query(`DROP TABLE \`post_hashtags\``);
        await queryRunner.query(`DROP INDEX \`IDX_7fedde18872deb14e4889361d7\` ON \`hashtags\``);
        await queryRunner.query(`DROP TABLE \`hashtags\``);
    }

}
