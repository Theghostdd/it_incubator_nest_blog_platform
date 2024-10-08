import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostService } from '../post-service';
import { PostRepository } from '../../infrastructure/post-repositories';
import { PostUpdateModel } from '../../api/models/input/post-input.model';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../../base/types/types';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { BlogService } from '../../../blog/application/blog-service';
import { Blog } from '../../../blog/domain/blog.entity';
import { Post } from '../../domain/post.entity';
export class UpdatePostByIdCommand {
  constructor(
    public id: number,
    public postUpdateModel: PostUpdateModel,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdateByIdHandler
  implements ICommandHandler<UpdatePostByIdCommand, AppResultType>
{
  constructor(
    private readonly postService: PostService,
    private readonly blogService: BlogService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly postRepository: PostRepository,
  ) {}
  async execute(command: UpdatePostByIdCommand): Promise<AppResultType> {
    const blog: AppResultType<Blog | null> = await this.blogService.getBlogById(
      command.postUpdateModel.blogId,
    );
    if (blog.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const post: AppResultType<Post | null> = await this.postService.getPostById(
      command.id,
    );
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    post.data.updatePost(command.postUpdateModel);
    await this.postRepository.save(post.data);
    return this.applicationObjectResult.success(null);
  }
}
