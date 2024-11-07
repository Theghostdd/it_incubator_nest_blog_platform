import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWinStatusForGamePlayer1731013660789 implements MigrationInterface {
    name = 'AddWinStatusForGamePlayer1731013660789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_players" ADD "winStatus" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_players" DROP COLUMN "winStatus"`);
    }

}
