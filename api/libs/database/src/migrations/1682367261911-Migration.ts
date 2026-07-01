import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1682367261911 implements MigrationInterface {
  name = 'Migration1682367261911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`definitions_type\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`definition_type\` varchar(255) NOT NULL, \`description\` text NULL, \`creator_user_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_5c2d009c01bd030efb0f600826\` (\`definition_type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`values_definition\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`value_definition\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`validation_type\` varchar(255) NULL, \`creator_user_id\` varchar(255) NULL, \`modifier_user_id\` varchar(255) NULL, \`definition_type_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification_change\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`actor_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification_object\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`entity\` varchar(255) NOT NULL, \`content\` longtext NULL, \`redirect\` varchar(255) NULL, \`entity_type_id\` varchar(36) NULL, \`notification_change_id\` varchar(36) NULL, UNIQUE INDEX \`REL_ad0a6849eebcaaa0172c446db7\` (\`notification_change_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`read\` tinyint NOT NULL DEFAULT 0, \`notification_object_id\` varchar(36) NULL, \`notifier_id\` varchar(36) NULL, UNIQUE INDEX \`REL_78067773ff66c200b130f99211\` (\`notification_object_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cognito_id\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`display_name\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`phone_number\` varchar(255) NOT NULL, \`dob\` datetime NULL, \`address_line1\` varchar(255) NULL, \`address_line2\` datetime NULL, \`city\` varchar(255) NULL, \`state\` varchar(255) NULL, \`country\` varchar(255) NOT NULL, \`zip_code\` varchar(255) NOT NULL, \`age\` varchar(255) NULL, \`gender\` varchar(255) NULL, \`diagnosis_year\` varchar(255) NOT NULL, \`diagnosis_date\` timestamp NULL, \`timeline\` varchar(255) NULL, \`phone_number_location\` varchar(255) NULL, \`profile_picture\` varchar(255) NULL, \`config\` json NULL, \`description\` text NULL, \`diagnosis_type_id\` varchar(36) NULL, \`diagnosis_subtype_id\` varchar(36) NULL, \`designation_id\` varchar(36) NULL, \`role_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_24f393ce6efc331a76831ffc81\` (\`cognito_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`event\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`event_id\` varchar(255) NOT NULL, \`log_time\` timestamp NOT NULL, \`counter\` int NOT NULL, \`event_type_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`values_definition\` ADD CONSTRAINT \`FK_e4b359698e03c95e35089f3475b\` FOREIGN KEY (\`definition_type_id\`) REFERENCES \`definitions_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_change\` ADD CONSTRAINT \`FK_714ab7527d414773b8e38a282b9\` FOREIGN KEY (\`actor_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_object\` ADD CONSTRAINT \`FK_5e4ff68d1b46ad5a2f31e85489b\` FOREIGN KEY (\`entity_type_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_object\` ADD CONSTRAINT \`FK_ad0a6849eebcaaa0172c446db7b\` FOREIGN KEY (\`notification_change_id\`) REFERENCES \`notification_change\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_78067773ff66c200b130f992119\` FOREIGN KEY (\`notification_object_id\`) REFERENCES \`notification_object\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_bec9f49053dc5b1db26f7aa7f4d\` FOREIGN KEY (\`notifier_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_8fe6f1459a2387f193dd5e2b317\` FOREIGN KEY (\`diagnosis_type_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_15f8f90ed8ffa2f3f4e20ad3ef4\` FOREIGN KEY (\`diagnosis_subtype_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_b562051ee1314f5627caf10c2f6\` FOREIGN KEY (\`designation_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` ADD CONSTRAINT \`FK_b966ddf4f5772104155218035a6\` FOREIGN KEY (\`event_type_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` ADD CONSTRAINT \`FK_e6358bd3df1b2874637dca92bcf\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_e6358bd3df1b2874637dca92bcf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_b966ddf4f5772104155218035a6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_b562051ee1314f5627caf10c2f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_15f8f90ed8ffa2f3f4e20ad3ef4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_8fe6f1459a2387f193dd5e2b317\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_bec9f49053dc5b1db26f7aa7f4d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_78067773ff66c200b130f992119\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_object\` DROP FOREIGN KEY \`FK_ad0a6849eebcaaa0172c446db7b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_object\` DROP FOREIGN KEY \`FK_5e4ff68d1b46ad5a2f31e85489b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_change\` DROP FOREIGN KEY \`FK_714ab7527d414773b8e38a282b9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`values_definition\` DROP FOREIGN KEY \`FK_e4b359698e03c95e35089f3475b\``,
    );
    await queryRunner.query(`DROP TABLE \`event\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_24f393ce6efc331a76831ffc81\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(
      `DROP INDEX \`REL_78067773ff66c200b130f99211\` ON \`notification\``,
    );
    await queryRunner.query(`DROP TABLE \`notification\``);
    await queryRunner.query(
      `DROP INDEX \`REL_ad0a6849eebcaaa0172c446db7\` ON \`notification_object\``,
    );
    await queryRunner.query(`DROP TABLE \`notification_object\``);
    await queryRunner.query(`DROP TABLE \`notification_change\``);
    await queryRunner.query(`DROP TABLE \`values_definition\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5c2d009c01bd030efb0f600826\` ON \`definitions_type\``,
    );
    await queryRunner.query(`DROP TABLE \`definitions_type\``);
  }
}
