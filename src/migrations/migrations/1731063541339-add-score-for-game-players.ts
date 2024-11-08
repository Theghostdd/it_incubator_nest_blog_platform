import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScoreForGamePlayers1731063541339 implements MigrationInterface {
    name = 'AddScoreForGamePlayers1731063541339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_players" ADD "score" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_players" DROP COLUMN "score"`);
    }

}
