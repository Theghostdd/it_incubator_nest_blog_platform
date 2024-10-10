import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInputModel } from '../../api/model/input/comment-input.model';
import { PostService } from '../../../post/application/post-service';
import { CommentRepositories } from '../../infrastructure/comment-repositories';
import { UserService } from '../../../../users/user/application/user-service';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { User } from '../../../../users/user/domain/user.entity';
import { Post } from '../../../post/domain/post.entity';
import { Comment } from '../../domain/comment.entity';
import { Inject } from '@nestjs/common';

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
    @Inject(Comment.name) private readonly commentEntity: typeof Comment,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<AppResultType<number>> {
    const { userId, postId } = command;
    const user: AppResultType<User | null> =
      await this.userService.getUserById(userId);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const post: AppResultType<Post | null> =
      await this.postService.getPostById(postId);
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const date: Date = new Date();
    const comment: Comment = this.commentEntity.createComment(
      command.inputCommentModel,
      user.data,
      post.data,
      date,
    );
    const result: number = await this.commentRepositories.save(comment);
    return this.applicationObjectResult.success(result);
  }
}
