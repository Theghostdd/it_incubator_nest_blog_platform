import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { CommentService } from '../comment-service';
import { CommentRepositories } from '../../infrastructure/comment-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { CommentDocumentType } from '../../domain/comment.entity';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class DeleteCommentCommand {
  constructor(
    public id: string,
    public userId: string,
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
    const comment: AppResultType<CommentDocumentType> =
      await this.commentService.getCommentById(id);
    if (comment.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();
    if (comment.data.commentatorInfo.userId !== userId)
      return this.applicationObjectResult.forbidden();

    await this.commentRepositories.delete(comment.data);
    return this.applicationObjectResult.success(null);
  }
}
