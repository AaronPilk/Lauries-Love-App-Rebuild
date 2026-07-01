import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735934769351 implements MigrationInterface {
    name = 'Migration1735934769351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`geo_location\` json NULL`);
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
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`geo_location\``);
    }

}
