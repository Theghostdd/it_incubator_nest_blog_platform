import { MigrationInterface, QueryRunner } from "typeorm";

export class LikesAddedIndexes1729165552530 implements MigrationInterface {
    name = 'LikesAddedIndexes1729165552530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_0e95caa8a8b56d7797569cf5dc" ON "post_like" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_909fc474ef645901d01f0cc066" ON "post_like" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e3c92f0d6dc9646bc0c4a6738c" ON "post_like" ("parentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a1d7e38c5a9fa3964019e25252" ON "post_like" ("lastUpdateAt", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_dd6264d9c8dc45a2aeabf6f7be" ON "post_like" ("createdAt", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_04f93e6f1ace5dbc1d8c562ccb" ON "comment_like" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5a2fc7a9a2b6bcc8c74f6fbb8" ON "comment_like" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ebfdb4a4590dfbcbad327753f8" ON "comment_like" ("parentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d6bf8a406332116574a72e5ba" ON "comment_like" ("lastUpdateAt", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_f898119db8ee7145dda9563ef6" ON "comment_like" ("createdAt", "status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f898119db8ee7145dda9563ef6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d6bf8a406332116574a72e5ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ebfdb4a4590dfbcbad327753f8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5a2fc7a9a2b6bcc8c74f6fbb8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04f93e6f1ace5dbc1d8c562ccb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dd6264d9c8dc45a2aeabf6f7be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1d7e38c5a9fa3964019e25252"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3c92f0d6dc9646bc0c4a6738c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_909fc474ef645901d01f0cc066"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e95caa8a8b56d7797569cf5dc"`);
    }

}
