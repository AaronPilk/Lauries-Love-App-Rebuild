import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1685988248032 implements MigrationInterface {
  name = 'Migration1685988248032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`display_name\` \`display_name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`last_name\` \`last_name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phone_number\` \`phone_number\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`country\` \`country\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`zip_code\` \`zip_code\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`diagnosis_year\` \`diagnosis_year\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`diagnosis_year\` \`diagnosis_year\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`zip_code\` \`zip_code\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`country\` \`country\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phone_number\` \`phone_number\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`last_name\` \`last_name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`display_name\` \`display_name\` varchar(255) NOT NULL`,
    );
  }
}
