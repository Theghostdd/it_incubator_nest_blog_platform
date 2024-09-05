import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { CommentDocumentType } from '../../domain/comment.entity';
import { CommentService } from '../comment-service';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { CommentUpdateModel } from '../../api/model/input/comment-input.model';
import { CommentRepositories } from '../../infrastructure/comment-repositories';

export class UpdateCommentCommand {
  constructor(
    public id: string,
    public userId: string,
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
    const comment: AppResultType<CommentDocumentType> =
      await this.commentService.commentIsExistById(id);
    if (comment.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    if (comment.data.commentatorInfo.userId !== userId)
      return this.applicationObjectResult.forbidden();

    comment.data.updateComment(command.commentUpdateModel);
    await this.commentRepositories.save(comment.data);

    return this.applicationObjectResult.success(null);
  }
}
