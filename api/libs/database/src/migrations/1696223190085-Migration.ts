import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1696223190085 implements MigrationInterface {
    name = 'Migration1696223190085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_15f8f90ed8ffa2f3f4e20ad3ef4\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_8fe6f1459a2387f193dd5e2b317\``);
        await queryRunner.query(`CREATE TABLE \`user_diagnosis_types_values_definition\` (\`user_id\` varchar(36) NOT NULL, \`values_definition_id\` varchar(36) NOT NULL, INDEX \`IDX_153eb8b75fd81c0207dd64fe8e\` (\`user_id\`), INDEX \`IDX_f56c31ea87d5688f6e5e3018b5\` (\`values_definition_id\`), PRIMARY KEY (\`user_id\`, \`values_definition_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_diagnosis_sub_types_values_definition\` (\`user_id\` varchar(36) NOT NULL, \`values_definition_id\` varchar(36) NOT NULL, INDEX \`IDX_acd0b8d5b3280fd22d15f032fd\` (\`user_id\`), INDEX \`IDX_45f5d68858f97aa8ecb2e48937\` (\`values_definition_id\`), PRIMARY KEY (\`user_id\`, \`values_definition_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`diagnosis_type_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`diagnosis_subtype_id\``);
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_types_values_definition\` ADD CONSTRAINT \`FK_153eb8b75fd81c0207dd64fe8e0\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_types_values_definition\` ADD CONSTRAINT \`FK_f56c31ea87d5688f6e5e3018b54\` FOREIGN KEY (\`values_definition_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_sub_types_values_definition\` ADD CONSTRAINT \`FK_acd0b8d5b3280fd22d15f032fd5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_sub_types_values_definition\` ADD CONSTRAINT \`FK_45f5d68858f97aa8ecb2e489373\` FOREIGN KEY (\`values_definition_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_sub_types_values_definition\` DROP FOREIGN KEY \`FK_45f5d68858f97aa8ecb2e489373\``);
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_sub_types_values_definition\` DROP FOREIGN KEY \`FK_acd0b8d5b3280fd22d15f032fd5\``);
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_types_values_definition\` DROP FOREIGN KEY \`FK_f56c31ea87d5688f6e5e3018b54\``);
        await queryRunner.query(`ALTER TABLE \`user_diagnosis_types_values_definition\` DROP FOREIGN KEY \`FK_153eb8b75fd81c0207dd64fe8e0\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`diagnosis_subtype_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`diagnosis_type_id\` varchar(36) NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_45f5d68858f97aa8ecb2e48937\` ON \`user_diagnosis_sub_types_values_definition\``);
        await queryRunner.query(`DROP INDEX \`IDX_acd0b8d5b3280fd22d15f032fd\` ON \`user_diagnosis_sub_types_values_definition\``);
        await queryRunner.query(`DROP TABLE \`user_diagnosis_sub_types_values_definition\``);
        await queryRunner.query(`DROP INDEX \`IDX_f56c31ea87d5688f6e5e3018b5\` ON \`user_diagnosis_types_values_definition\``);
        await queryRunner.query(`DROP INDEX \`IDX_153eb8b75fd81c0207dd64fe8e\` ON \`user_diagnosis_types_values_definition\``);
        await queryRunner.query(`DROP TABLE \`user_diagnosis_types_values_definition\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_8fe6f1459a2387f193dd5e2b317\` FOREIGN KEY (\`diagnosis_type_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_15f8f90ed8ffa2f3f4e20ad3ef4\` FOREIGN KEY (\`diagnosis_subtype_id\`) REFERENCES \`values_definition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
