import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment, CommentType } from '../domain/comment.entity';
import { CommentUpdateModel } from '../api/model/input/comment-input.model';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class CommentRepositories {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async save(comment: Comment): Promise<number> {
    const query = `
        INSERT INTO ${tablesName.COMMENTS}
        ("content", "userId", "blogId", "postId", "likesCount", "dislikesCount", "createdAt", "isActive")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING "id";
    `;
    const result: { id: number }[] = await this.dataSource.query(query, [
      comment.content,
      comment.userId,
      comment.postId,
      comment.likesCount,
      comment.dislikesCount,
      comment.createdAt,
      true,
    ]);
    return result[0].id;
  }

  async delete(commentId: number): Promise<void> {
    const query = `
        UPDATE "${tablesName.COMMENTS}"
        SET "isActive" = ${false}
        WHERE "id" = $1 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [commentId]);
  }

  async getCommentById(id: number): Promise<CommentType | null> {
    const query = `
        SELECT "id", "content", "userId", "blogId", "postId", "likesCount", "dislikesCount", "createdAt"
        FROM "${tablesName.COMMENTS}"
        WHERE "id" = $1 AND "isActive" = ${true}
    `;
    const result: CommentType[] | [] = await this.dataSource.query(query, [id]);
    return result.length > 0 ? result[0] : null;
  }

  async updateCommentById(
    id: number,
    commentUpdateModel: CommentUpdateModel,
  ): Promise<void> {
    const query = `
        UPDATE "${tablesName.COMMENTS}"
        SET "content" = $1
        WHERE "id" = $2 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [commentUpdateModel.content, id]);
  }

  async updateCommentLikeById(
    id: number,
    likeCount: number,
    dislikeCount: number,
  ): Promise<void> {
    const query = `
        UPDATE "${tablesName.COMMENTS}"
        SET "likesCount" = "likesCount" + $1, 
            "dislikesCount" = "dislikesCount" + $2
        WHERE "id" = $3 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [likeCount, dislikeCount, id]);
  }
}
