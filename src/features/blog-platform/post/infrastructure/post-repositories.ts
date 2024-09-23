import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post, PostBlogJoinType, PostType } from '../domain/post.entity';
import { PostUpdateModel } from '../api/models/input/post-input.model';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class PostRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async save(post: Post): Promise<number> {
    const query = `
      INSERT INTO ${tablesName.POSTS}
      ("title", "shortDescription", "content", "blogId", "likesCount", "dislikesCount", "createdAt", "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING "id"
    `;
    const result: { id: number }[] = await this.dataSource.query(query, [
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.likesCount,
      post.dislikesCount,
      post.createdAt,
      true,
    ]);
    return result[0].id;
  }

  async delete(postId: number): Promise<void> {
    const query = `
        UPDATE "${tablesName.POSTS}"
        SET "isActive" = ${false}
        WHERE "id" = $1 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [postId]);
  }

  async getPostById(id: number): Promise<PostType | null> {
    const query = `
        SELECT "p"."id", "p"."title", "p"."shortDescription", "p"."content", "p"."blogId", "p"."likesCount", "p"."dislikesCount", "p"."createdAt", "b"."name" as "blogName"       
        FROM ${tablesName.POSTS} as "p"
        LEFT JOIN ${tablesName.BLOGS} as "b"
        ON "p"."blogId" = "b"."id" AND "b"."isActive" = ${true}
        WHERE "p"."id" = $1 AND "p"."isActive" = ${true}
    `;
    const result: PostBlogJoinType[] | [] = await this.dataSource.query(query, [
      id,
    ]);
    return result.length > 0 ? result[0] : null;
  }

  async updatePostById(
    id: number,
    postUpdateModel: PostUpdateModel,
  ): Promise<void> {
    const query = `
        UPDATE ${tablesName.POSTS}
        SET "title" = $1, "shortDescription" = $2, "content" = $3 
        WHERE "id" = $4 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [
      postUpdateModel.title,
      postUpdateModel.shortDescription,
      postUpdateModel.content,
      id,
    ]);
  }

  async updatePostLikeById(
    id: number,
    likeCount: number,
    dislikeCount: number,
  ): Promise<void> {
    const query = `
        UPDATE ${tablesName.POSTS}
        SET "likesCount" = "likesCount" + $1, 
            "dislikesCount" = "dislikesCount" + $2
        WHERE "id" = $3 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [likeCount, dislikeCount, id]);
  }
}
