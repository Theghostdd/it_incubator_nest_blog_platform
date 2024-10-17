import { MigrationInterface, QueryRunner } from "typeorm";

export class UserConfirmationAddedIndexes1729162622170 implements MigrationInterface {
    name = 'UserConfirmationAddedIndexes1729162622170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_91dafc916c0b062251022eddb3" ON "user_confirmation" ("isConfirm") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c5d80c553c3e5771556272c7a4" ON "user_confirmation" ("confirmationCode") `);
        await queryRunner.query(`CREATE INDEX "IDX_3c15304649ca2ab532ccb9990a" ON "user_confirmation" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3c15304649ca2ab532ccb9990a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5d80c553c3e5771556272c7a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91dafc916c0b062251022eddb3"`);
    }

}
