import { Injectable } from '@nestjs/common';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../base/types/types';
import { PostLikeRepositories } from '../infrastructure/post-like-repositories';
import { PostLike } from '../domain/post-like.entity';

@Injectable()
export class PostLikeService {
  constructor(
    private readonly postLikeRepositories: PostLikeRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async getLikeByUserIdAndParentId(
    userId: number,
    parentId: number,
  ): Promise<AppResultType<PostLike | null>> {
    const like: PostLike | null =
      await this.postLikeRepositories.getLikeByUserAndParentId(
        userId,
        parentId,
      );
    if (!like) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(like);
  }
}
