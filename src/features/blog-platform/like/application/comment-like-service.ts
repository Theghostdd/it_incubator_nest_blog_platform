import { Injectable } from '@nestjs/common';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../base/types/types';
import { CommentLikeRepositories } from '../infrastructure/comment-like-repositories';
import { CommentLike } from '../domain/comment-like.entity';

@Injectable()
export class CommentLikeService {
  constructor(
    private readonly commentLikeRepositories: CommentLikeRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async getLikeByUserIdAndParentId(
    userId: number,
    parentId: number,
  ): Promise<AppResultType<CommentLike | null>> {
    const like: CommentLike | null =
      await this.commentLikeRepositories.getLikeByUserAndParentId(
        userId,
        parentId,
      );
    if (!like) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(like);
  }
}
