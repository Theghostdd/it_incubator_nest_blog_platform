import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentLike } from '../domain/comment-like.entity';
import { LikePropertyEnum } from '../domain/type';

@Injectable()
export class CommentLikeRepositories {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
  ) {}

  async save(like: CommentLike): Promise<void> {
    await this.commentLikeRepository.save(like);
  }

  async getLikeByUserAndParentId(
    userId: number,
    parentId: number,
  ): Promise<CommentLike | null> {
    return await this.commentLikeRepository.findOne({
      where: {
        [LikePropertyEnum.userId]: userId,
        [LikePropertyEnum.parentId]: parentId,
      },
    });
  }
}
