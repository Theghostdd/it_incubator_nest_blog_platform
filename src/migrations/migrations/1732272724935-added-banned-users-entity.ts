import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedBannedUsersEntity1732272724935 implements MigrationInterface {
    name = 'AddedBannedUsersEntity1732272724935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_ban" ("id" SERIAL NOT NULL, "reason" text NOT NULL, "dateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isActive" boolean NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_9f75b2f627b383463e35f2f59a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isBan" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_ban" ADD CONSTRAINT "FK_29416a34d6a46110133499f1cf0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_ban" DROP CONSTRAINT "FK_29416a34d6a46110133499f1cf0"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isBan"`);
        await queryRunner.query(`DROP TABLE "user_ban"`);
    }

}
