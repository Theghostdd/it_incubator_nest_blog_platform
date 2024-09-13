import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { CommentService } from '../comment-service';
import { CommentRepositories } from '../../infrastructure/comment-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { CommentType } from '../../domain/comment.entity';

export class DeleteCommentCommand {
  constructor(
    public id: number,
    public userId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand, AppResultType>
{
  constructor(
    private readonly commentService: CommentService,
    private readonly commentRepositories: CommentRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<AppResultType> {
    const { id, userId } = command;
    const comment: AppResultType<CommentType> =
      await this.commentService.getCommentById(id);
    if (comment.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();
    if (comment.data.userId !== userId)
      return this.applicationObjectResult.forbidden();

    await this.commentRepositories.delete(comment.data.id);
    return this.applicationObjectResult.success(null);
  }
}
