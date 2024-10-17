import { MigrationInterface, QueryRunner } from "typeorm";

export class UserLoginEmailUniqAndCreateIndexes1729162268035 implements MigrationInterface {
    name = 'UserLoginEmailUniqAndCreateIndexes1729162268035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_f3fdb715ccec25cd60ca0cf641" ON "user" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_c4206476e337c11260fc69b443" ON "user" ("login", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_b95b86d74034c7b87472ab30e8" ON "user" ("email", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3e8adfe124168b978b1164a35" ON "user" ("login", "email", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_0b7f1030070c7393312eb51ee2" ON "user" ("id", "isActive") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0b7f1030070c7393312eb51ee2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3e8adfe124168b978b1164a35"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b95b86d74034c7b87472ab30e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c4206476e337c11260fc69b443"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3fdb715ccec25cd60ca0cf641"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_a62473490b3e4578fd683235c5e"`);
    }

}
