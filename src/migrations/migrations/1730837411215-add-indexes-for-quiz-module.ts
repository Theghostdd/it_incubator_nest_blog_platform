import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesForQuizModule1730837411215 implements MigrationInterface {
    name = 'AddIndexesForQuizModule1730837411215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_dd43c79153f971987931eb15df" ON "quiz_question_answer" ("questionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_da851143f4b337e180430920e2" ON "quiz_questions" ("body") `);
        await queryRunner.query(`CREATE INDEX "IDX_e02b076a398fec31d05a78d378" ON "game_user_answer" ("gameQuestionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_509ae7df5a698ed42f1e4dcf41" ON "game_user_answer" ("playerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0545c377fe4b81dfb82497b19" ON "game_questions" ("gameId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f2de5b0489bd9ecea902b3c3e" ON "game_questions" ("questionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c06f64fd4b451c218a2b88d94" ON "quiz_game" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_66d478167a4c11e2ad1ba74e52" ON "game_players" ("gameId") `);
        await queryRunner.query(`CREATE INDEX "IDX_58e348072733ba21f07f4feca2" ON "game_players" ("playerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7687919bf054bf262c669d3ae2" ON "player" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7687919bf054bf262c669d3ae2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58e348072733ba21f07f4feca2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66d478167a4c11e2ad1ba74e52"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1c06f64fd4b451c218a2b88d94"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f2de5b0489bd9ecea902b3c3e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0545c377fe4b81dfb82497b19"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_509ae7df5a698ed42f1e4dcf41"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e02b076a398fec31d05a78d378"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da851143f4b337e180430920e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dd43c79153f971987931eb15df"`);
    }

}
