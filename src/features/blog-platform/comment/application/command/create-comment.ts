import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInputModel } from '../../api/model/input/comment-input.model';
import { UserService } from '../../../../users/user/application/user-service';
import { AppResultType } from '../../../../../base/types/types';
import { UserDocumentType } from '../../../../users/user/domain/user.entity';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { PostService } from '../../../post/application/post-service';
import { PostDocumentType } from '../../../post/domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentRepositories } from '../../infrastructure/comment-repositories';

export class CreateCommentByPostIdCommand {
  constructor(
    public inputCommentModel: CommentInputModel,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdHandler
  implements
    ICommandHandler<CreateCommentByPostIdCommand, AppResultType<string>>
{
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly commentRepositories: CommentRepositories,
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<AppResultType<string>> {
    const { userId, postId } = command;
    const user: AppResultType<UserDocumentType | null> =
      await this.userService.userIsExistById(userId);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const post: AppResultType<PostDocumentType | null> =
      await this.postService.postIsExistById(postId);
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const comment = this.commentModel.createComment(
      command.inputCommentModel,
      userId,
      user.data.login,
      postId,
      post.data.blogId,
    );
    await this.commentRepositories.save(comment);
    return this.applicationObjectResult.success(comment._id.toString());
  }
}
