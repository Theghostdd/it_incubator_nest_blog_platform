import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CommentMapperOutputModel,
  CommentOutputModel,
} from '../api/model/output/comment-output.model';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EntityTypeEnum } from '../../like/domain/type';
import { tablesName } from '../../../../core/utils/tables/tables';
import { CommentLikeJoinType } from '../domain/comment.entity';
import { PostType } from '../../post/domain/post.entity';

@Injectable()
export class CommentQueryRepositories {
  constructor(
    private readonly commentMapperOutputModel: CommentMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getCommentById(
    id: number,
    userId?: number,
  ): Promise<CommentOutputModel> {
    const query = `
      SELECT "c"."id", "c"."content", "c"."userId", "c"."userLogin", "c"."likesCount", "c"."dislikesCount", "c"."createdAt", COALESCE("l"."status", 'None') as "status"
      FROM ${tablesName.COMMENTS} as "c"
      LEFT JOIN ${tablesName.LIKES} as "l"
      ON ("l"."userId" = $1 OR "l"."userId" IS NULL)
      AND "l"."parentId" = "c"."id"
      AND "l"."entityType" = $2
      AND "l"."isActive" = true
      WHERE "c"."id" = $3 AND "c"."isActive" = true
    `;
    const result: CommentLikeJoinType[] | [] = await this.dataSource.query(
      query,
      [userId || null, EntityTypeEnum.Comment, id],
    );

    if (result.length <= 0) throw new NotFoundException('Comment not found');

    return this.commentMapperOutputModel.commentModel(result[0]);
  }

  async getCommentsByPostId(
    query: BaseSorting,
    postId: string,
    userId?: number,
  ): Promise<BasePagination<CommentOutputModel[] | []>> {
    const postQuery = `
      SELECT "id"
      FROM ${tablesName.POSTS}
      WHERE "id" = $1
    `;
    const post: PostType[] | [] = await this.dataSource.query(postQuery, [
      postId,
    ]);
    if (post.length <= 0) throw new NotFoundException('Post not found');

    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const getTotalDocument: { count: number }[] = await this.dataSource.query(
      `
            SELECT COUNT(*) 
            FROM ${tablesName.COMMENTS}
            WHERE "postId" = $1 AND "isActive" = true
    `,
      [postId],
    );
    const totalCount: number = +getTotalDocument[0].count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (+pageNumber - 1) * pageSize;

    const queryComments = `
        SELECT "c"."id", "c"."content", "c"."userId", "c"."userLogin", "c"."likesCount", "c"."dislikesCount", "c"."createdAt", COALESCE("l"."status", 'None') as "status"
        FROM ${tablesName.COMMENTS} as "c"
        LEFT JOIN ${tablesName.LIKES} as "l"
        ON ("l"."userId" = $1 OR $1 IS NULL)
        AND "l"."parentId" = "c"."id" 
        AND "l"."entityType" = $2 
        AND "l"."isActive" = true
        WHERE "c"."postId" = $3 AND "c"."isActive" = true
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $4 OFFSET $5 
    `;
    const comments: CommentLikeJoinType[] | [] = await this.dataSource.query(
      queryComments,
      [userId || null, EntityTypeEnum.Comment, postId, pageSize, skip],
    );

    return {
      pagesCount: +pagesCount,
      page: +pageNumber!,
      pageSize: +pageSize!,
      totalCount: +totalCount,
      items:
        comments.length > 0
          ? this.commentMapperOutputModel.commentsModel(comments)
          : [],
    };
  }
}
