import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocumentType, LikeModelType } from '../domain/like.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikeRepositories {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: LikeModelType,
  ) {}

  async save(like: LikeDocumentType): Promise<void> {
    await like.save();
  }

  async getLikeByUserAndParentId(
    userId: string,
    parentId: string,
  ): Promise<LikeDocumentType | null> {
    return this.likeModel.findOne({ userId: userId, parentId: parentId });
  }
}
