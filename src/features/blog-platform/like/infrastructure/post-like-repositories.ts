import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from '../domain/post-like.entity';
import { LikePropertyEnum } from '../domain/type';

@Injectable()
export class PostLikeRepositories {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
  ) {}
  async save(like: PostLike): Promise<void> {
    await this.postLikeRepository.save(like);
  }

  async getLikeByUserAndParentId(
    userId: number,
    parentId: number,
  ): Promise<PostLike | null> {
    return await this.postLikeRepository.findOne({
      where: {
        [LikePropertyEnum.userId]: userId,
        [LikePropertyEnum.parentId]: parentId,
      },
    });
  }
}
