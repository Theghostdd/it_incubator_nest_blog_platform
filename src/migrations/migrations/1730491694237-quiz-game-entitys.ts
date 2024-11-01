import { MigrationInterface, QueryRunner } from "typeorm";

export class QuizGameEntitys1730491694237 implements MigrationInterface {
    name = 'QuizGameEntitys1730491694237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "game_user_answer" ("id" SERIAL NOT NULL, "body" text NOT NULL, "isTrue" boolean NOT NULL, "isFirst" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE, "questionId" integer NOT NULL, "playerId" integer NOT NULL, CONSTRAINT "PK_50909cda008a2189eda3effc6c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_game_player" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, CONSTRAINT "REL_b2727544227d7e6f658a14239f" UNIQUE ("userId"), CONSTRAINT "PK_80c41568b522aedcd19c601ebd6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_players" ("id" SERIAL NOT NULL, "playerNumber" integer NOT NULL, "gameId" integer NOT NULL, "playerId" integer NOT NULL, CONSTRAINT "PK_a99af25a1c97122f04ba778197c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_game" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "startGameAt" TIMESTAMP WITH TIME ZONE, "finishGameAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_dd15fda9924eaca7bf9159b766b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_questions" ("id" SERIAL NOT NULL, "position" integer NOT NULL, "gameId" integer NOT NULL, "questionId" integer NOT NULL, CONSTRAINT "PK_8655fa1f9639162ee24c3a5582a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "game_user_answer" ADD CONSTRAINT "FK_9c4c6e0c43fda8c2596d5305a6e" FOREIGN KEY ("questionId") REFERENCES "game_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_user_answer" ADD CONSTRAINT "FK_509ae7df5a698ed42f1e4dcf41e" FOREIGN KEY ("playerId") REFERENCES "quiz_game_player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_game_player" ADD CONSTRAINT "FK_b2727544227d7e6f658a14239f1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_players" ADD CONSTRAINT "FK_66d478167a4c11e2ad1ba74e52f" FOREIGN KEY ("gameId") REFERENCES "quiz_game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_players" ADD CONSTRAINT "FK_58e348072733ba21f07f4feca2f" FOREIGN KEY ("playerId") REFERENCES "quiz_game_player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_a0545c377fe4b81dfb82497b19a" FOREIGN KEY ("gameId") REFERENCES "quiz_game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6"`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_a0545c377fe4b81dfb82497b19a"`);
        await queryRunner.query(`ALTER TABLE "game_players" DROP CONSTRAINT "FK_58e348072733ba21f07f4feca2f"`);
        await queryRunner.query(`ALTER TABLE "game_players" DROP CONSTRAINT "FK_66d478167a4c11e2ad1ba74e52f"`);
        await queryRunner.query(`ALTER TABLE "quiz_game_player" DROP CONSTRAINT "FK_b2727544227d7e6f658a14239f1"`);
        await queryRunner.query(`ALTER TABLE "game_user_answer" DROP CONSTRAINT "FK_509ae7df5a698ed42f1e4dcf41e"`);
        await queryRunner.query(`ALTER TABLE "game_user_answer" DROP CONSTRAINT "FK_9c4c6e0c43fda8c2596d5305a6e"`);
        await queryRunner.query(`DROP TABLE "game_questions"`);
        await queryRunner.query(`DROP TABLE "quiz_game"`);
        await queryRunner.query(`DROP TABLE "game_players"`);
        await queryRunner.query(`DROP TABLE "quiz_game_player"`);
        await queryRunner.query(`DROP TABLE "game_user_answer"`);
    }

}
