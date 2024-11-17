import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post-repositories';
import { PostService } from '../post-service';
import { Post } from '../../domain/post.entity';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../../base/types/types';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { BlogService } from '../../../blog/application/blog-service';
import { Blog } from '../../../blog/domain/blog.entity';

export class DeletePostByIdCommand {
  constructor(
    public postId: number,
    public isAdmin: boolean,
    public blogId?: number,
    public userId?: number,
  ) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdHandler
  implements ICommandHandler<DeletePostByIdCommand, AppResultType>
{
  constructor(
    private readonly postService: PostService,
    private readonly blogService: BlogService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly postRepository: PostRepository,
  ) {}
  async execute(command: DeletePostByIdCommand): Promise<AppResultType> {
    const { isAdmin, postId, userId, blogId } = command;
    if (blogId) {
      const blog: AppResultType<Blog | null> =
        await this.blogService.getBlogById(blogId);
      if (blog.appResult !== AppResult.Success)
        return this.applicationObjectResult.notFound();

      if (!isAdmin) {
        if (blog.data.ownerId !== userId)
          return this.applicationObjectResult.forbidden();
      }
    }

    const post: AppResultType<Post | null> =
      await this.postService.getPostById(postId);

    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    post.data.deletePost();
    await this.postRepository.save(post.data);
    return this.applicationObjectResult.success(null);
  }
}
