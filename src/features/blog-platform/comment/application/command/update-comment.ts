import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentService } from '../comment-service';
import { CommentUpdateModel } from '../../api/model/input/comment-input.model';
import { CommentRepositories } from '../../infrastructure/comment-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../../base/types/types';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { Comment } from '../../domain/comment.entity';

export class UpdateCommentCommand {
  constructor(
    public id: number,
    public userId: number,
    public commentUpdateModel: CommentUpdateModel,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand, AppResultType>
{
  constructor(
    private readonly commentService: CommentService,
    private readonly commentRepositories: CommentRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(command: UpdateCommentCommand): Promise<AppResultType> {
    const { id, userId } = command;
    const comment: AppResultType<Comment> =
      await this.commentService.getCommentById(id);
    if (comment.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();
    if (comment.data.userId !== userId)
      return this.applicationObjectResult.forbidden();

    comment.data.updateComment(command.commentUpdateModel);
    await this.commentRepositories.save(comment.data);
    return this.applicationObjectResult.success(null);
  }
}
