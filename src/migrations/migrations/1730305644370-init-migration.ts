import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1730305644370 implements MigrationInterface {
    name = 'InitMigration1730305644370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_confirmation" ("id" SERIAL NOT NULL, "isConfirm" boolean NOT NULL DEFAULT false, "confirmationCode" character varying NOT NULL DEFAULT 'none', "dataExpire" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_3c15304649ca2ab532ccb9990a1" UNIQUE ("userId"), CONSTRAINT "REL_3c15304649ca2ab532ccb9990a" UNIQUE ("userId"), CONSTRAINT "PK_6d0847bd8c1ad0cfb1a95319add" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_91dafc916c0b062251022eddb3" ON "user_confirmation" ("isConfirm") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5d80c553c3e5771556272c7a4" ON "user_confirmation" ("confirmationCode") `);
        await queryRunner.query(`CREATE INDEX "IDX_3c15304649ca2ab532ccb9990a" ON "user_confirmation" ("userId") `);
        await queryRunner.query(`CREATE TABLE "recovery_password_session" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "code" character varying NOT NULL, "expAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "userId" integer NOT NULL, CONSTRAINT "PK_7fe37cbfca7b41978f671ecfae7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d103e14bed51ec038c3265db57" ON "recovery_password_session" ("code") `);
        await queryRunner.query(`CREATE TABLE "auth_session" ("deviceId" character varying NOT NULL, "ip" character varying NOT NULL, "deviceName" character varying NOT NULL, "issueAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "userId" integer NOT NULL, CONSTRAINT "PK_7cf61e0ad7f43e442c5e49fe508" PRIMARY KEY ("deviceId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7cf61e0ad7f43e442c5e49fe50" ON "auth_session" ("deviceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c072b729d71697f959bde66ade" ON "auth_session" ("userId") `);
        await queryRunner.query(`CREATE TABLE "blog" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "websiteUrl" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isMembership" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ac8995bfa676a3a49a23fd8fe9" ON "blog" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_cba14b9ef77ef8c8d35ff283f0" ON "blog" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "post_like" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastUpdateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer NOT NULL, "parentId" integer NOT NULL, CONSTRAINT "PK_0e95caa8a8b56d7797569cf5dc6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_85b128b87d705b63c35ff90f90" ON "post_like" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_9bf475e810cac6a9e8a45cac0a" ON "post_like" ("lastUpdateAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_909fc474ef645901d01f0cc066" ON "post_like" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e3c92f0d6dc9646bc0c4a6738c" ON "post_like" ("parentId") `);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "shortDescription" character varying NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "blogId" integer NOT NULL, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e28aa0c4114146bfb1567bfa9a" ON "post" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb91bea2d37140a877b775e6b2" ON "post" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_d0418ddc42c5707dbc37b05bef" ON "post" ("blogId") `);
        await queryRunner.query(`CREATE TABLE "comment_like" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastUpdateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer NOT NULL, "parentId" integer NOT NULL, CONSTRAINT "PK_04f93e6f1ace5dbc1d8c562ccbf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6c412b35054938401958d75faf" ON "comment_like" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0c3aa2cf92785d2b08a4dda3b" ON "comment_like" ("lastUpdateAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5a2fc7a9a2b6bcc8c74f6fbb8" ON "comment_like" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ebfdb4a4590dfbcbad327753f8" ON "comment_like" ("parentId") `);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "userId" integer NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3edd3cdb7232a3e9220607eabb" ON "comment" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0354a9a009d3bb45a08655ce3" ON "comment" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_94a85bb16d24033a2afdd5df06" ON "comment" ("postId") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "login" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a62473490b3e4578fd683235c5" ON "user" ("login") `);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_bec1a7d56ad6e762a1e2ce527b" ON "user" ("login", "email") `);
        await queryRunner.query(`CREATE TABLE "quiz_questions" ("id" SERIAL NOT NULL, "body" text NOT NULL, "published" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ec0447fd30d9f5c182e7653bfd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_question_answer" ("id" SERIAL NOT NULL, "body" text NOT NULL, "questionId" integer NOT NULL, CONSTRAINT "PK_c0064a93b20f0d65efb33cc2097" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_confirmation" ADD CONSTRAINT "FK_3c15304649ca2ab532ccb9990a1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recovery_password_session" ADD CONSTRAINT "FK_b2d056996bcaae0f55b26b8bbdb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_session" ADD CONSTRAINT "FK_c072b729d71697f959bde66ade0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "FK_e3c92f0d6dc9646bc0c4a6738c2" FOREIGN KEY ("parentId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "FK_909fc474ef645901d01f0cc0662" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_like" ADD CONSTRAINT "FK_ebfdb4a4590dfbcbad327753f83" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_like" ADD CONSTRAINT "FK_b5a2fc7a9a2b6bcc8c74f6fbb8b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_question_answer" ADD CONSTRAINT "FK_dd43c79153f971987931eb15df6" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_question_answer" DROP CONSTRAINT "FK_dd43c79153f971987931eb15df6"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP CONSTRAINT "FK_b5a2fc7a9a2b6bcc8c74f6fbb8b"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP CONSTRAINT "FK_ebfdb4a4590dfbcbad327753f83"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9"`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "FK_909fc474ef645901d01f0cc0662"`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "FK_e3c92f0d6dc9646bc0c4a6738c2"`);
        await queryRunner.query(`ALTER TABLE "auth_session" DROP CONSTRAINT "FK_c072b729d71697f959bde66ade0"`);
        await queryRunner.query(`ALTER TABLE "recovery_password_session" DROP CONSTRAINT "FK_b2d056996bcaae0f55b26b8bbdb"`);
        await queryRunner.query(`ALTER TABLE "user_confirmation" DROP CONSTRAINT "FK_3c15304649ca2ab532ccb9990a1"`);
        await queryRunner.query(`DROP TABLE "quiz_question_answer"`);
        await queryRunner.query(`DROP TABLE "quiz_questions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bec1a7d56ad6e762a1e2ce527b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a62473490b3e4578fd683235c5"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94a85bb16d24033a2afdd5df06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0354a9a009d3bb45a08655ce3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3edd3cdb7232a3e9220607eabb"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ebfdb4a4590dfbcbad327753f8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5a2fc7a9a2b6bcc8c74f6fbb8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0c3aa2cf92785d2b08a4dda3b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6c412b35054938401958d75faf"`);
        await queryRunner.query(`DROP TABLE "comment_like"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0418ddc42c5707dbc37b05bef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb91bea2d37140a877b775e6b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e28aa0c4114146bfb1567bfa9a"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3c92f0d6dc9646bc0c4a6738c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_909fc474ef645901d01f0cc066"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bf475e810cac6a9e8a45cac0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85b128b87d705b63c35ff90f90"`);
        await queryRunner.query(`DROP TABLE "post_like"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cba14b9ef77ef8c8d35ff283f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ac8995bfa676a3a49a23fd8fe9"`);
        await queryRunner.query(`DROP TABLE "blog"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c072b729d71697f959bde66ade"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7cf61e0ad7f43e442c5e49fe50"`);
        await queryRunner.query(`DROP TABLE "auth_session"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d103e14bed51ec038c3265db57"`);
        await queryRunner.query(`DROP TABLE "recovery_password_session"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c15304649ca2ab532ccb9990a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5d80c553c3e5771556272c7a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91dafc916c0b062251022eddb3"`);
        await queryRunner.query(`DROP TABLE "user_confirmation"`);
    }

}
