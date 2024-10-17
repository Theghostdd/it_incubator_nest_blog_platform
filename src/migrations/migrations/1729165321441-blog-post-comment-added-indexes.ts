import { MigrationInterface, QueryRunner } from "typeorm";

export class BlogPostCommentAddedIndexes1729165321441 implements MigrationInterface {
    name = 'BlogPostCommentAddedIndexes1729165321441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_877556dedbff077f99d4a27e2a" ON "blog" ("name", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca6a6252a991c438d5036e7b9e" ON "blog" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_60fdf3337d2d932b5dc47e9526" ON "blog" ("id", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_d0418ddc42c5707dbc37b05bef" ON "post" ("blogId") `);
        await queryRunner.query(`CREATE INDEX "IDX_81747b22a1a8cca76c0e5e1dd7" ON "post" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_44303d328a900c34df333a6cee" ON "post" ("title", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_d8ab88aaccd1eb0a6919d70541" ON "post" ("id", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0354a9a009d3bb45a08655ce3" ON "comment" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_94a85bb16d24033a2afdd5df06" ON "comment" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b1dd0e632f851387c382a168e" ON "comment" ("createdAt", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe6aba17cdd7dc56f7ec8b7cfc" ON "comment" ("id", "isActive") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fe6aba17cdd7dc56f7ec8b7cfc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b1dd0e632f851387c382a168e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94a85bb16d24033a2afdd5df06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0354a9a009d3bb45a08655ce3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8ab88aaccd1eb0a6919d70541"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44303d328a900c34df333a6cee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_81747b22a1a8cca76c0e5e1dd7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0418ddc42c5707dbc37b05bef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60fdf3337d2d932b5dc47e9526"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca6a6252a991c438d5036e7b9e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_877556dedbff077f99d4a27e2a"`);
    }

}
