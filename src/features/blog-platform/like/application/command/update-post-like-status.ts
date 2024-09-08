import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { PostDocumentType } from '../../../post/domain/post.entity';
import { PostService } from '../../../post/application/post-service';
import { LikeInputModel } from '../../api/models/input/like-input-model';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { LikeService } from '../like-service';
import {
  Like,
  LikeDocumentType,
  LikeModelType,
} from '../../domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatusEnum } from '../../domain/type';
import { LikeRepositories } from '../../infrastructure/like-repositories';
import { PostRepository } from '../../../post/infrastructure/post-repositories';
import { LikeChangeCount } from '../../domain/models';
import { CalculateLike } from '../../domain/calculate-like';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeInputModel: LikeInputModel,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusHandler
  implements ICommandHandler<UpdatePostLikeStatusCommand, AppResultType>
{
  constructor(
    private readonly postService: PostService,
    private readonly likeService: LikeService,
    private readonly likeRepositories: LikeRepositories,
    private readonly postRepositories: PostRepository,
    @InjectModel(Like.name) private readonly likeModel: LikeModelType,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly calculateLike: CalculateLike,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<AppResultType> {
    const { postId, userId } = command;
    const post: AppResultType<PostDocumentType | null> =
      await this.postService.getPostById(postId);
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const like: AppResultType<LikeDocumentType | null> =
      await this.likeService.getLikeByUserIdAndParentId(userId, postId);
    if (like.appResult !== AppResult.Success) {
      const newLike: LikeDocumentType = this.likeModel.createLikeInstance(
        command.likeInputModel,
        postId,
        userId,
      );

      post.data.updateLikesCount(
        0,
        0,
        command.likeInputModel.likeStatus as LikeStatusEnum,
      );

      await Promise.all([
        this.likeRepositories.save(newLike),
        this.postRepositories.save(post.data),
      ]);

      return this.applicationObjectResult.success(null);
    }

    const changeCountLike: LikeChangeCount = this.calculateLike.calculate(
      command.likeInputModel.likeStatus as LikeStatusEnum,
      like.data.status,
    );
    like.data.updateLikeStatus(changeCountLike.newStatus);
    post.data.updateLikesCount(
      changeCountLike.newLikesCount,
      changeCountLike.newDislikesCount,
    );

    await Promise.all([
      this.likeRepositories.save(like.data),
      this.postRepositories.save(post.data),
    ]);

    return this.applicationObjectResult.success(null);
  }
}
