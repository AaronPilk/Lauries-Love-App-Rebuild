import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1683475796453 implements MigrationInterface {
  name = 'Migration1683475796453';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payment\` (\`id\` varchar(255) NOT NULL, \`active\` tinyint NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`payment_id\` varchar(255) NOT NULL, \`description\` text NULL, \`account_type\` varchar(255) NOT NULL, \`account_number\` varchar(255) NOT NULL, \`payment_status\` varchar(255) NOT NULL, \`items\` json NOT NULL, \`amount\` int NOT NULL, \`payment_type_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_045d4c3aa6a3051cc2b586cc2d7\` FOREIGN KEY (\`payment_type_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_c66c60a17b56ec882fcd8ec770b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_c66c60a17b56ec882fcd8ec770b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_045d4c3aa6a3051cc2b586cc2d7\``,
    );
    await queryRunner.query(`DROP TABLE \`payment\``);
  }
}
