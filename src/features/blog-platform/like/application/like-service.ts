import { LikeRepositories } from '../infrastructure/like-repositories';
import { Injectable } from '@nestjs/common';
import { LikeType } from '../domain/like.entity';
import { EntityTypeEnum } from '../domain/type';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../base/types/types';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepositories: LikeRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async getLikeByUserIdAndParentId(
    userId: number,
    parentId: number,
    entityType: EntityTypeEnum,
  ): Promise<AppResultType<LikeType | null>> {
    const like: LikeType | null =
      await this.likeRepositories.getLikeByUserAndParentId(
        userId,
        parentId,
        entityType,
      );
    if (!like) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(like);
  }
}
