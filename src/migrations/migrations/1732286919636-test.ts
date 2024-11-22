import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1732286919636 implements MigrationInterface {
    name = 'Test1732286919636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_ban" DROP CONSTRAINT "FK_29416a34d6a46110133499f1cf0"`);
        await queryRunner.query(`ALTER TABLE "user_ban" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_ban" ADD CONSTRAINT "FK_29416a34d6a46110133499f1cf0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_ban" DROP CONSTRAINT "FK_29416a34d6a46110133499f1cf0"`);
        await queryRunner.query(`ALTER TABLE "user_ban" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_ban" ADD CONSTRAINT "FK_29416a34d6a46110133499f1cf0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
