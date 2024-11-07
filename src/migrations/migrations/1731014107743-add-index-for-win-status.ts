import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexForWinStatus1731014107743 implements MigrationInterface {
    name = 'AddIndexForWinStatus1731014107743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_c1e627de47648542c615e4ae84" ON "game_players" ("winStatus") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c1e627de47648542c615e4ae84"`);
    }

}
