import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { LikeStatusEnum } from './type';
import { LikeInputModel } from '../api/models/input/like-input-model';
import { LikeChangeCount, LikeStatusState } from './models';

@Schema()
export class Like {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  parentId: string;
  @Prop({ type: String, required: true, enum: Object.values(LikeStatusEnum) })
  status: LikeStatusEnum;
  @Prop({ type: String, required: true, default: new Date().toISOString() })
  createdAt: string;
  @Prop({ type: String, required: true, default: new Date().toISOString() })
  lastUpdateAt: string;

  static createLikeInstance(
    likeInputModel: LikeInputModel,
    parentId: string,
    userId: string,
  ) {
    const like = new this();
    like.parentId = parentId;
    like.userId = userId;
    like.status = likeInputModel.likeStatus as LikeStatusEnum;
    like.createdAt = new Date().toISOString();
    like.lastUpdateAt = new Date().toISOString();
    return like;
  }

  updateLikeStatus(likeStatus: LikeStatusEnum) {
    this.status = likeStatus;
  }

  changeCountLike(
    likeStatus: LikeStatusEnum,
    currentStatus: LikeStatusEnum,
  ): LikeChangeCount {
    const likeState: LikeStatusState = {
      [LikeStatusEnum.Like]: {
        [LikeStatusEnum.Like]: {
          newLikesCount: 0,
          newDislikesCount: 0,
          newStatus: LikeStatusEnum.Like,
        },
        [LikeStatusEnum.Dislike]: {
          newLikesCount: +1,
          newDislikesCount: -1,
          newStatus: LikeStatusEnum.Like,
        },
        [LikeStatusEnum.None]: {
          newLikesCount: +1,
          newDislikesCount: 0,
          newStatus: LikeStatusEnum.Like,
        },
      },

      [LikeStatusEnum.Dislike]: {
        [LikeStatusEnum.Like]: {
          newLikesCount: -1,
          newDislikesCount: +1,
          newStatus: LikeStatusEnum.Dislike,
        },
        [LikeStatusEnum.Dislike]: {
          newLikesCount: 0,
          newDislikesCount: 0,
          newStatus: LikeStatusEnum.Dislike,
        },
        [LikeStatusEnum.None]: {
          newLikesCount: 0,
          newDislikesCount: +1,
          newStatus: LikeStatusEnum.Dislike,
        },
      },

      [LikeStatusEnum.None]: {
        [LikeStatusEnum.Like]: {
          newLikesCount: -1,
          newDislikesCount: 0,
          newStatus: LikeStatusEnum.None,
        },
        [LikeStatusEnum.Dislike]: {
          newLikesCount: 0,
          newDislikesCount: -1,
          newStatus: LikeStatusEnum.None,
        },
        [LikeStatusEnum.None]: {
          newLikesCount: 0,
          newDislikesCount: 0,
          newStatus: LikeStatusEnum.None,
        },
      },
    };

    return likeState[likeStatus][currentStatus];
  }
}

export const LikeSchema: MongooseSchema<Like> =
  SchemaFactory.createForClass(Like);
LikeSchema.loadClass(Like);
export type LikeDocumentType = HydratedDocument<Like>;

type LikeModelStaticType = {
  createLikeInstance: (
    likeInputModel: LikeInputModel,
    parentId: string,
    userId: string,
  ) => LikeDocumentType;
};

export type LikeModelType = Model<LikeDocumentType> & LikeModelStaticType;
