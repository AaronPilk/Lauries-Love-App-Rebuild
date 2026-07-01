import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1737663009691 implements MigrationInterface {
    name = 'Migration1737663009691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_object\` DROP FOREIGN KEY \`FK_ad0a6849eebcaaa0172c446db7b\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_78067773ff66c200b130f992119\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_37d2ace7f95c1dd0ae665a570dd\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_6f327bd90aba348e276d42ecf22\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`sender_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`sender_id\` varchar(255) NOT NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`receiver_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`receiver_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_object\` ADD CONSTRAINT \`FK_ad0a6849eebcaaa0172c446db7b\` FOREIGN KEY (\`notification_change_id\`) REFERENCES \`notification_change\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_78067773ff66c200b130f992119\` FOREIGN KEY (\`notification_object_id\`) REFERENCES \`notification_object\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_37d2ace7f95c1dd0ae665a570dd\` FOREIGN KEY (\`sender_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_6f327bd90aba348e276d42ecf22\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_6f327bd90aba348e276d42ecf22\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_37d2ace7f95c1dd0ae665a570dd\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_78067773ff66c200b130f992119\``);
        await queryRunner.query(`ALTER TABLE \`notification_object\` DROP FOREIGN KEY \`FK_ad0a6849eebcaaa0172c446db7b\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`receiver_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`receiver_id\` varchar(36) NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` DROP COLUMN \`sender_id\``);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD \`sender_id\` varchar(36) NULL`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_6f327bd90aba348e276d42ecf22\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_37d2ace7f95c1dd0ae665a570dd\` FOREIGN KEY (\`sender_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_78067773ff66c200b130f992119\` FOREIGN KEY (\`notification_object_id\`) REFERENCES \`notification_object\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_object\` ADD CONSTRAINT \`FK_ad0a6849eebcaaa0172c446db7b\` FOREIGN KEY (\`notification_change_id\`) REFERENCES \`notification_change\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
