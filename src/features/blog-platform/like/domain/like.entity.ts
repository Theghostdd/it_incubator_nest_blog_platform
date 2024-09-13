import { EntityTypeEnum, LikeStatusEnum } from './type';
import { LikeInputModel } from '../api/models/input/like-input-model';
import { Injectable } from '@nestjs/common';

export class Like {
  userId: number;
  parentId: number;
  entityType: EntityTypeEnum;
  status: LikeStatusEnum;
  createdAt: Date;
  lastUpdateAt: Date;
}

export type LikeType = Like & { id: number };

@Injectable()
export class LikeFactory {
  constructor() {}
  create(
    likeInputModel: LikeInputModel,
    parentId: number,
    userId: number,
    entityType: EntityTypeEnum,
  ): Like {
    const like = new Like();
    like.userId = userId;
    like.parentId = parentId;
    like.entityType = entityType;
    like.status = likeInputModel.likeStatus;
    like.createdAt = new Date();
    like.lastUpdateAt = new Date();
    return like;
  }
}
