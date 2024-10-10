import { LikeInputModel } from '../../api/models/input/like-input-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentService } from '../../../comment/application/comment-service';
import { CommentLikeService } from '../comment-like-service';
import { Comment } from '../../../comment/domain/comment.entity';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { CommentLikeRepositories } from '../../infrastructure/comment-like-repositories';
import { Inject } from '@nestjs/common';
import { UserService } from '../../../../users/user/application/user-service';
import { User } from '../../../../users/user/domain/user.entity';
import { CommentLike } from '../../domain/comment-like.entity';

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
    private readonly commentLikeService: CommentLikeService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly commentLikeRepositories: CommentLikeRepositories,
    private readonly userService: UserService,
    @Inject(CommentLike.name)
    private readonly commentLikeEntity: typeof CommentLike,
  ) {}

  async execute(
    command: UpdateCommentLikeStatusCommand,
  ): Promise<AppResultType> {
    const { commentId, userId } = command;
    const user: AppResultType<User | null> =
      await this.userService.getUserById(userId);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();
    const comment: AppResultType<Comment> =
      await this.commentService.getCommentById(commentId);
    if (comment.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const like: AppResultType<CommentLike | null> =
      await this.commentLikeService.getLikeByUserIdAndParentId(
        userId,
        commentId,
      );

    const date: Date = new Date();
    if (like.appResult !== AppResult.Success) {
      const newLike: CommentLike = this.commentLikeEntity.createLike(
        command.likeInputModel,
        comment.data,
        user.data,
        date,
        date,
      );
      await this.commentLikeRepositories.save(newLike);
      return this.applicationObjectResult.success(null);
    }

    like.data.updateLikeStatus(command.likeInputModel, date);
    await this.commentLikeRepositories.save(like.data);
    return this.applicationObjectResult.success(null);
  }
}
