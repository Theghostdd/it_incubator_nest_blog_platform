import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Like, LikeType } from '../domain/like.entity';
import { tablesName } from '../../../../core/utils/tables/tables';
import { EntityTypeEnum, LikeStatusEnum } from '../domain/type';

@Injectable()
export class LikeRepositories {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(like: Like): Promise<void> {
    const query = `
      INSERT INTO ${tablesName.LIKES}
      ("userId", "parentId", "entityType", "status", "createdAt", "lastUpdateAt", "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    await this.dataSource.query(query, [
      like.userId,
      like.parentId,
      like.entityType,
      like.status,
      like.createdAt,
      like.lastUpdateAt,
      true,
    ]);
  }

  async getLikeByUserAndParentId(
    userId: number,
    parentId: number,
    entityType: EntityTypeEnum,
  ): Promise<LikeType | null> {
    const query = `
        SELECT id, "userId", "parentId", "entityType", "status", "createdAt", "lastUpdateAt"
        FROM ${tablesName.LIKES}
        WHERE "userId" = $1 AND "parentId" = $2 AND "entityType" = $3 AND "isActive" = true
    `;
    const result: LikeType[] | [] = await this.dataSource.query(query, [
      userId,
      parentId,
      entityType,
    ]);
    return result.length > 0 ? result[0] : null;
  }

  async updateLikeById(
    id: number,
    parentId: number,
    entityType: EntityTypeEnum,
    likeStatus: LikeStatusEnum,
  ): Promise<void> {
    const query = `
      UPDATE ${tablesName.LIKES}
       SET "status" = $1
       WHERE "id" = $2 AND "entityType" = $3 AND "parentId" = $4 AND "isActive" = true 
    `;
    await this.dataSource.query(query, [likeStatus, id, entityType, parentId]);
  }
}
