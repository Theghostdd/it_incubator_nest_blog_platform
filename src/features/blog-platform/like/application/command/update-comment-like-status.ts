import { LikeInputModel } from '../../api/models/input/like-input-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentService } from '../../../comment/application/comment-service';
import { LikeService } from '../like-service';
import { LikeRepositories } from '../../infrastructure/like-repositories';
import { CommentRepositories } from '../../../comment/infrastructure/comment-repositories';
import { EntityTypeEnum, LikeStatusEnum } from '../../domain/type';
import { LikeChangeCount } from '../../domain/models';
import { CalculateLike } from '../../domain/calculate-like';
import { CommentType } from '../../../comment/domain/comment.entity';
import { Like, LikeFactory, LikeType } from '../../domain/like.entity';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: number,
    public userId: number,
    public likeInputModel: LikeInputModel,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusHandler
  implements ICommandHandler<UpdateCommentLikeStatusCommand, AppResultType>
{
  constructor(
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
    private readonly likeRepositories: LikeRepositories,
    private readonly commentRepositories: CommentRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly calculateLike: CalculateLike,
    private readonly likeFactory: LikeFactory,
  ) {}

  async execute(
    command: UpdateCommentLikeStatusCommand,
  ): Promise<AppResultType> {
    const { commentId, userId } = command;
    const comment: AppResultType<CommentType> =
      await this.commentService.getCommentById(commentId);
    if (comment.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const like: AppResultType<LikeType | null> =
      await this.likeService.getLikeByUserIdAndParentId(
        userId,
        commentId,
        EntityTypeEnum.Comment,
      );

    if (like.appResult !== AppResult.Success) {
      const newLike: Like = this.likeFactory.create(
        command.likeInputModel,
        commentId,
        userId,
        EntityTypeEnum.Comment,
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
        this.commentRepositories.updateCommentLikeById(
          comment.data.id,
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
        commentId,
        EntityTypeEnum.Comment,
        changeCountLike.newStatus,
      ),
      this.commentRepositories.updateCommentLikeById(
        commentId,
        changeCountLike.newLikesCount,
        changeCountLike.newDislikesCount,
      ),
    ]);

    return this.applicationObjectResult.success(null);
  }
}
