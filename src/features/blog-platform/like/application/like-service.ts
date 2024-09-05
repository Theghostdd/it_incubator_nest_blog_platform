import { LikeRepositories } from '../infrastructure/like-repositories';
import { AppResultType } from '../../../../base/types/types';
import { LikeDocumentType } from '../domain/like.entity';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepositories: LikeRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async likeIsExistByUserIdAndParentId(
    userId: string,
    parentId: string,
  ): Promise<AppResultType<LikeDocumentType | null>> {
    const like: LikeDocumentType | null =
      await this.likeRepositories.getLikeByUserAndParentId(userId, parentId);
    if (!like) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(like);
  }
}
