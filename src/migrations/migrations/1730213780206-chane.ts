import { MigrationInterface, QueryRunner } from "typeorm";

export class Chane1730213780206 implements MigrationInterface {
    name = 'Chane1730213780206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_384e04e5f8ac15fc338944170e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_225c78cc0d789cee46e64a2ae9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2e633e96fd70465850e0962f65"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_877556dedbff077f99d4a27e2a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca6a6252a991c438d5036e7b9e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60fdf3337d2d932b5dc47e9526"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e95caa8a8b56d7797569cf5dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1d7e38c5a9fa3964019e25252"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dd6264d9c8dc45a2aeabf6f7be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_81747b22a1a8cca76c0e5e1dd7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44303d328a900c34df333a6cee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8ab88aaccd1eb0a6919d70541"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04f93e6f1ace5dbc1d8c562ccb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d6bf8a406332116574a72e5ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f898119db8ee7145dda9563ef6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b1dd0e632f851387c382a168e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe6aba17cdd7dc56f7ec8b7cfc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3fdb715ccec25cd60ca0cf641"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c4206476e337c11260fc69b443"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b95b86d74034c7b87472ab30e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3e8adfe124168b978b1164a35"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0b7f1030070c7393312eb51ee2"`);
        await queryRunner.query(`CREATE INDEX "IDX_d103e14bed51ec038c3265db57" ON "recovery_password_session" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_7cf61e0ad7f43e442c5e49fe50" ON "auth_session" ("deviceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c072b729d71697f959bde66ade" ON "auth_session" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ac8995bfa676a3a49a23fd8fe9" ON "blog" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_cba14b9ef77ef8c8d35ff283f0" ON "blog" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_85b128b87d705b63c35ff90f90" ON "post_like" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_9bf475e810cac6a9e8a45cac0a" ON "post_like" ("lastUpdateAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_e28aa0c4114146bfb1567bfa9a" ON "post" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb91bea2d37140a877b775e6b2" ON "post" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_6c412b35054938401958d75faf" ON "comment_like" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0c3aa2cf92785d2b08a4dda3b" ON "comment_like" ("lastUpdateAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_3edd3cdb7232a3e9220607eabb" ON "comment" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_a62473490b3e4578fd683235c5" ON "user" ("login") `);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_bec1a7d56ad6e762a1e2ce527b" ON "user" ("login", "email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bec1a7d56ad6e762a1e2ce527b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a62473490b3e4578fd683235c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3edd3cdb7232a3e9220607eabb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0c3aa2cf92785d2b08a4dda3b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6c412b35054938401958d75faf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb91bea2d37140a877b775e6b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e28aa0c4114146bfb1567bfa9a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bf475e810cac6a9e8a45cac0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85b128b87d705b63c35ff90f90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cba14b9ef77ef8c8d35ff283f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ac8995bfa676a3a49a23fd8fe9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c072b729d71697f959bde66ade"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7cf61e0ad7f43e442c5e49fe50"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d103e14bed51ec038c3265db57"`);
        await queryRunner.query(`CREATE INDEX "IDX_0b7f1030070c7393312eb51ee2" ON "user" ("id", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3e8adfe124168b978b1164a35" ON "user" ("email", "isActive", "login") `);
        await queryRunner.query(`CREATE INDEX "IDX_b95b86d74034c7b87472ab30e8" ON "user" ("email", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_c4206476e337c11260fc69b443" ON "user" ("isActive", "login") `);
        await queryRunner.query(`CREATE INDEX "IDX_f3fdb715ccec25cd60ca0cf641" ON "user" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe6aba17cdd7dc56f7ec8b7cfc" ON "comment" ("id", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b1dd0e632f851387c382a168e" ON "comment" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_f898119db8ee7145dda9563ef6" ON "comment_like" ("createdAt", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d6bf8a406332116574a72e5ba" ON "comment_like" ("lastUpdateAt", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_04f93e6f1ace5dbc1d8c562ccb" ON "comment_like" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d8ab88aaccd1eb0a6919d70541" ON "post" ("id", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_44303d328a900c34df333a6cee" ON "post" ("isActive", "title") `);
        await queryRunner.query(`CREATE INDEX "IDX_81747b22a1a8cca76c0e5e1dd7" ON "post" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_dd6264d9c8dc45a2aeabf6f7be" ON "post_like" ("createdAt", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_a1d7e38c5a9fa3964019e25252" ON "post_like" ("lastUpdateAt", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_0e95caa8a8b56d7797569cf5dc" ON "post_like" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_60fdf3337d2d932b5dc47e9526" ON "blog" ("id", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca6a6252a991c438d5036e7b9e" ON "blog" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_877556dedbff077f99d4a27e2a" ON "blog" ("isActive", "name") `);
        await queryRunner.query(`CREATE INDEX "IDX_2e633e96fd70465850e0962f65" ON "auth_session" ("deviceId", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_225c78cc0d789cee46e64a2ae9" ON "auth_session" ("isActive", "userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_384e04e5f8ac15fc338944170e" ON "recovery_password_session" ("code", "isActive") `);
    }

}
