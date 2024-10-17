import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthSessionAndRecoveryPasswordSessionAddedIndexes1729164914734 implements MigrationInterface {
    name = 'AuthSessionAndRecoveryPasswordSessionAddedIndexes1729164914734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_384e04e5f8ac15fc338944170e" ON "recovery_password_session" ("code", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_225c78cc0d789cee46e64a2ae9" ON "auth_session" ("userId", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_2e633e96fd70465850e0962f65" ON "auth_session" ("deviceId", "isActive") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2e633e96fd70465850e0962f65"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_225c78cc0d789cee46e64a2ae9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_384e04e5f8ac15fc338944170e"`);
    }

}
