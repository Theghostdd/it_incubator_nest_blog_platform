import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PostMapperOutputModel,
  PostOutputModel,
} from '../api/models/output/post-output.model';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { EntityTypeEnum, LikeStatusEnum } from '../../like/domain/type';
import {
  LastPostLikeJoinType,
  LastPostsLikeJoinType,
  PostLikeJoinType,
} from '../domain/post.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';
import { BlogType } from '../../blog/domain/blog.entity';

@Injectable()
export class PostQueryRepository {
  constructor(
    private readonly postMapperOutputModel: PostMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getPostById(id: number, userId?: number): Promise<PostOutputModel> {
    const postQuery = `
      SELECT "p".*, COALESCE("l"."status", 'None') as "status"
      FROM ${tablesName.POSTS} as "p"
      LEFT JOIN ${tablesName.LIKES} as "l"
      ON ("l"."userId" = $1 OR "l"."userId" IS NULL)
      AND "l"."parentId" = "p"."id" 
      AND "l"."entityType" = $2 
      AND "l"."isActive" = true
      WHERE "p"."id" = $3 AND "p"."isActive" = true
    `;
    const post: PostLikeJoinType[] | [] = await this.dataSource.query(
      postQuery,
      [userId || null, EntityTypeEnum.Post, id],
    );
    if (post.length <= 0) throw new NotFoundException('Post not found');

    const likeQuery = `
        SELECT "l"."lastUpdateAt", "u"."login" as "userLogin", "u"."id" as "userId"
        FROM likes as "l"
        JOIN users as "u"
        ON "u"."id" = "l"."userId"
        AND "u"."isActive" = true
        WHERE "l"."parentId" = $1 AND "l"."entityType" = $2 AND "l"."status" = $3 AND "l"."isActive" = true
        ORDER BY "l"."lastUpdateAt" DESC
        LIMIT 3
    `;
    const lastLikes: LastPostLikeJoinType[] | [] = await this.dataSource.query(
      likeQuery,
      [id, EntityTypeEnum.Post, LikeStatusEnum.Like],
    );

    return this.postMapperOutputModel.postModel(
      post[0],
      lastLikes.length <= 0 ? [] : lastLikes,
    );
  }

  async getPosts(
    query: BaseSorting,
    blogId?: number,
    userId?: number,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    if (blogId) {
      const blogQuery = `
          SELECT "id"
          FROM ${tablesName.BLOGS}
          WHERE "id" = $1 AND "isActive" = true
      `;
      const blog: BlogType[] | [] = await this.dataSource.query(blogQuery, [
        blogId,
      ]);
      if (blog.length <= 0) throw new NotFoundException('Blog not found');
    }

    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const getTotalDocument: { count: number }[] = await this.dataSource.query(
      `
        SELECT COUNT(*)
        FROM ${tablesName.POSTS} 
        WHERE "blogId" = $1 OR $1 IS NULL AND "isActive" = true
      `,
      [blogId || null],
    );
    const totalCount: number = +getTotalDocument[0].count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (+pageNumber - 1) * pageSize;

    const postQuery = `
        SELECT "p"."id", "p"."title", "p"."shortDescription", "p"."content", "p"."blogId", "p"."blogName", "p"."likesCount", "p"."dislikesCount", "p"."createdAt", COALESCE("l"."status", 'None') as "status"
        FROM ${tablesName.POSTS} as "p"
        LEFT JOIN ${tablesName.LIKES} as "l"
        ON ("l"."userId" = $1 OR "l"."userId" IS NULL)
        AND "l"."parentId" = "p"."id" 
        AND "l"."entityType" = $2 
        AND "l"."isActive" = true
        WHERE ("p"."blogId" = $3 OR $3 IS NULL) AND "p"."isActive" = true 
        ORDER BY $4 ${sortDirection}
        LIMIT $5 OFFSET $6;
    `;

    const posts: PostLikeJoinType[] | [] = await this.dataSource.query(
      postQuery,
      [
        userId || null,
        EntityTypeEnum.Post,
        blogId || null,
        sortBy,
        pageSize,
        skip,
      ],
    );

    let lastLikes: LastPostsLikeJoinType[] | [] = [];
    if (posts.length > 0) {
      const postIds: string = posts
        .map((post: PostLikeJoinType) => post.id)
        .join(',');

      const lastLikesQuery = `      
      SELECT "l"."lastUpdateAt", "l"."parentId" as "postId", "u"."login" as "userLogin", "u"."id" as "userId"
      FROM ${tablesName.LIKES} as "l"
      JOIN ${tablesName.USERS} as "u" ON "u"."id" = "l"."userId" AND "u"."isActive" = true
      WHERE "l"."id" IN (
        SELECT "l2"."id"
        FROM likes as "l2"
        WHERE "l2"."parentId" = "l"."parentId"
        AND "l2"."entityType" = $1
        AND "l2"."isActive" = true
        AND "l2"."status" = 'Like'
        ORDER BY "l2"."lastUpdateAt" DESC
        LIMIT 3
      )
      AND "l"."parentId" IN (${postIds})
      ORDER BY "l"."lastUpdateAt" DESC;
    `;

      lastLikes = await this.dataSource.query(lastLikesQuery, [
        EntityTypeEnum.Post,
      ]);
    }

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: this.postMapperOutputModel.postsModel(
        posts.length <= 0 ? [] : posts,
        lastLikes.length <= 0 ? [] : lastLikes,
      ),
    };
  }
}
