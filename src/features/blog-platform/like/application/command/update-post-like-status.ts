import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostService } from '../../../post/application/post-service';
import { LikeInputModel } from '../../api/models/input/like-input-model';
import { LikeService } from '../like-service';
import { EntityTypeEnum, LikeStatusEnum } from '../../domain/type';
import { LikeRepositories } from '../../infrastructure/like-repositories';
import { PostRepository } from '../../../post/infrastructure/post-repositories';
import { LikeChangeCount } from '../../domain/models';
import { CalculateLike } from '../../domain/calculate-like';
import { PostType } from '../../../post/domain/post.entity';
import { Like, LikeFactory, LikeType } from '../../domain/like.entity';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: number,
    public userId: number,
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
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly calculateLike: CalculateLike,
    private readonly likeFactory: LikeFactory,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<AppResultType> {
    const { postId, userId } = command;
    const post: AppResultType<PostType | null> =
      await this.postService.getPostById(postId);
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const like: AppResultType<LikeType | null> =
      await this.likeService.getLikeByUserIdAndParentId(
        userId,
        postId,
        EntityTypeEnum.Post,
      );
    if (like.appResult !== AppResult.Success) {
      const newLike: Like = this.likeFactory.create(
        command.likeInputModel,
        postId,
        userId,
        EntityTypeEnum.Post,
      );

      let likeCount = 0;
      let dislikeCount = 0;
      switch (command.likeInputModel.likeStatus) {
        case LikeStatusEnum.Like:
          likeCount = 1;
          break;
        case LikeStatusEnum.Dislike:
          dislikeCount = 1;
          break;
      }

      await Promise.all([
        this.likeRepositories.save(newLike),
        this.postRepositories.updatePostLikeById(
          post.data.id,
          likeCount,
          dislikeCount,
        ),
      ]);

      return this.applicationObjectResult.success(null);
    }

    const changeCountLike: LikeChangeCount = this.calculateLike.calculate(
      command.likeInputModel.likeStatus as LikeStatusEnum,
      like.data.status,
    );

    await Promise.all([
      this.likeRepositories.updateLikeById(
        like.data.id,
        postId,
        EntityTypeEnum.Post,
        changeCountLike.newStatus,
      ),
      this.postRepositories.updatePostLikeById(
        postId,
        changeCountLike.newLikesCount,
        changeCountLike.newDislikesCount,
      ),
    ]);

    return this.applicationObjectResult.success(null);
  }
}
