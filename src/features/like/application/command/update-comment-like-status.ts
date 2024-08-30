import { LikeInputModel } from '../../api/models/input/like-input-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../base/types/types';
import { CommentService } from '../../../comment/application/comment-service';
import { LikeService } from '../like-service';
import { LikeRepositories } from '../../infrastructure/like-repositories';
import { CommentRepositories } from '../../../comment/infrastructure/comment-repositories';
import {
  Like,
  LikeDocumentType,
  LikeModelType,
} from '../../domain/like.entity';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocumentType } from '../../../comment/domain/comment.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { LikeStatusEnum } from '../../domain/type';
import { LikeChangeCount } from '../../domain/models';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
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
    @InjectModel(Like.name) private readonly likeModel: LikeModelType,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async execute(
    command: UpdateCommentLikeStatusCommand,
  ): Promise<AppResultType> {
    const { commentId, userId } = command;
    const comment: AppResultType<CommentDocumentType> =
      await this.commentService.commentIsExistById(commentId);
    if (comment.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const like: AppResultType<LikeDocumentType | null> =
      await this.likeService.likeIsExistByUserIdAndParentId(userId, commentId);

    if (like.appResult !== AppResult.Success) {
      const newLike: LikeDocumentType = this.likeModel.createLikeInstance(
        command.likeInputModel,
        commentId,
        userId,
      );

      comment.data.updateLikesCount(
        0,
        0,
        command.likeInputModel.likeStatus as LikeStatusEnum,
      );

      await Promise.all([
        this.likeRepositories.save(newLike),
        this.commentRepositories.save(comment.data),
      ]);

      return this.applicationObjectResult.success(null);
    }

    const changeCountLike: LikeChangeCount = like.data.changeCountLike(
      command.likeInputModel.likeStatus as LikeStatusEnum,
      like.data.status,
    );
    like.data.updateLikeStatus(changeCountLike.newStatus);
    comment.data.updateLikesCount(
      changeCountLike.newLikesCount,
      changeCountLike.newDislikesCount,
    );

    await Promise.all([
      this.likeRepositories.save(like.data),
      this.commentRepositories.save(comment.data),
    ]);

    return this.applicationObjectResult.success(null);
  }
}
