import { MigrationInterface, QueryRunner } from "typeorm";

export class ChnageNameColumnInGame1730986589930 implements MigrationInterface {
    name = 'ChnageNameColumnInGame1730986589930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_game" RENAME COLUMN "createdAt" TO "pairCreatedDate"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_game" RENAME COLUMN "pairCreatedDate" TO "createdAt"`);
    }

}
