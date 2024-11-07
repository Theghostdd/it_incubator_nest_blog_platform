import { MigrationInterface, QueryRunner } from "typeorm";

export class ChnageNameColumnInGameFinishAndStart1730990348797 implements MigrationInterface {
    name = 'ChnageNameColumnInGameFinishAndStart1730990348797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_game" DROP COLUMN "startGameAt"`);
        await queryRunner.query(`ALTER TABLE "quiz_game" DROP COLUMN "finishGameAt"`);
        await queryRunner.query(`ALTER TABLE "quiz_game" ADD "startGameDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "quiz_game" ADD "finishGameDate" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_game" DROP COLUMN "finishGameDate"`);
        await queryRunner.query(`ALTER TABLE "quiz_game" DROP COLUMN "startGameDate"`);
        await queryRunner.query(`ALTER TABLE "quiz_game" ADD "finishGameAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "quiz_game" ADD "startGameAt" TIMESTAMP WITH TIME ZONE`);
    }

}
