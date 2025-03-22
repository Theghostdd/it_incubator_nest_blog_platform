import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInputModel } from '../../api/model/input/comment-input.model';
import { PostService } from '../../../post/application/post-service';
import { CommentRepositories } from '../../infrastructure/comment-repositories';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { Post } from '../../../post/domain/post.entity';
import { Comment } from '../../domain/comment.entity';
import { Inject } from '@nestjs/common';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';

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
    private readonly postService: PostService,
    private readonly userRepository: UserRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly commentRepositories: CommentRepositories,
    @Inject(Comment.name) private readonly commentEntity: typeof Comment,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<AppResultType<number>> {
    const { userId, postId } = command;
    const post: AppResultType<Post | null> =
      await this.postService.getPostById(postId);
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const user = await this.userRepository.getUserByIdWithBanInfoForSpecialBlog(
      userId,
      post.data.blogId,
    );

    if (!user) return this.applicationObjectResult.notFound();
    if (user.blogBanned[0].isBanned)
      return this.applicationObjectResult.forbidden();

    const date: Date = new Date();
    const comment: Comment = this.commentEntity.createComment(
      command.inputCommentModel,
      user,
      post.data,
      date,
    );
    const result: number = await this.commentRepositories.save(comment);
    return this.applicationObjectResult.success(result);
  }
}
