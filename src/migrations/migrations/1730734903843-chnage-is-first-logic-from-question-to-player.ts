import { MigrationInterface, QueryRunner } from "typeorm";

export class ChnageIsFirstLogicFromQuestionToPlayer1730734903843 implements MigrationInterface {
    name = 'ChnageIsFirstLogicFromQuestionToPlayer1730734903843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_user_answer" DROP COLUMN "isFirst"`);
        await queryRunner.query(`ALTER TABLE "game_players" ADD "isFirst" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_players" DROP COLUMN "isFirst"`);
        await queryRunner.query(`ALTER TABLE "game_user_answer" ADD "isFirst" boolean NOT NULL`);
    }

}
