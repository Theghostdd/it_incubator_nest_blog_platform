import { MigrationInterface, QueryRunner } from "typeorm";

export class Reinit1731873340700 implements MigrationInterface {
    name = 'Reinit1731873340700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "blog" ADD CONSTRAINT "FK_2168be0207735471e4dc0f72bb0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" DROP CONSTRAINT "FK_2168be0207735471e4dc0f72bb0"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "ownerId"`);
    }

}
