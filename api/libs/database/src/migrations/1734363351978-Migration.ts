import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734363351978 implements MigrationInterface {
    name = 'Migration1734363351978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`friend_request\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`status\` varchar(255) NOT NULL DEFAULT 0, \`sender_id\` varchar(36) NULL, \`receiver_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_37d2ace7f95c1dd0ae665a570dd\` FOREIGN KEY (\`sender_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_6f327bd90aba348e276d42ecf22\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_6f327bd90aba348e276d42ecf22\``);
        await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_37d2ace7f95c1dd0ae665a570dd\``);
        await queryRunner.query(`DROP TABLE \`friend_request\``);
    }

}
