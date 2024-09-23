import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInputModel } from '../../api/model/input/comment-input.model';
import { PostService } from '../../../post/application/post-service';
import { CommentRepositories } from '../../infrastructure/comment-repositories';
import { CommentFactory } from '../../domain/comment.entity';
import { PostType } from '../../../post/domain/post.entity';
import { UserService } from '../../../../users/user/application/user-service';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { UserType } from '../../../../users/user/domain/user.entity';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class CreateCommentByPostIdCommand {
  constructor(
    public inputCommentModel: CommentInputModel,
    public postId: number,
    public userId: number,
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdHandler
  implements
    ICommandHandler<CreateCommentByPostIdCommand, AppResultType<number>>
{
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly commentRepositories: CommentRepositories,
    private readonly commentFactory: CommentFactory,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<AppResultType<number>> {
    const { userId, postId } = command;
    const user: AppResultType<UserType | null> =
      await this.userService.getUserById(userId);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const post: AppResultType<PostType | null> =
      await this.postService.getPostById(postId);
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();
    const comment = this.commentFactory.create(
      command.inputCommentModel,
      userId,
      postId,
      post.data.blogId,
    );
    const result: number = await this.commentRepositories.save(comment);
    return this.applicationObjectResult.success(result);
  }
}
