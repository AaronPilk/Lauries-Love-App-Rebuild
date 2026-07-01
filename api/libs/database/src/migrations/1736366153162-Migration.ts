import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736366153162 implements MigrationInterface {
    name = 'Migration1736366153162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`address_line2\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`address_line2\` varchar(255) NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_37d2ace7f95c1dd0ae665a570dd\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_6f327bd90aba348e276d42ecf22\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`sender_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`sender_id\` varchar(255) NOT NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`receiver_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`receiver_id\` varchar(255) NOT NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_37d2ace7f95c1dd0ae665a570dd\` FOREIGN KEY (\`sender_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_6f327bd90aba348e276d42ecf22\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_6f327bd90aba348e276d42ecf22\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_37d2ace7f95c1dd0ae665a570dd\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`receiver_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`receiver_id\` varchar(36) NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`sender_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`sender_id\` varchar(36) NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_6f327bd90aba348e276d42ecf22\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_37d2ace7f95c1dd0ae665a570dd\` FOREIGN KEY (\`sender_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`address_line2\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`address_line2\` datetime NULL`);
    }

}
