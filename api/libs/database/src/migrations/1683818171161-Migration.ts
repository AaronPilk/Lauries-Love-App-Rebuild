import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1683818171161 implements MigrationInterface {
  name = 'Migration1683818171161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment\` ADD \`next_payment\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment\` ADD \`in_honor_name\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment\` DROP COLUMN \`in_honor_name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment\` DROP COLUMN \`next_payment\``,
    );
  }
}
