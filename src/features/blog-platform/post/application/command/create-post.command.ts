import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputModel } from '../../api/models/input/post-input.model';
import { PostRepository } from '../../infrastructure/post-repositories';
import { Post } from '../../domain/post.entity';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { BlogService } from '../../../blog/application/blog-service';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { Blog } from '../../../blog/domain/blog.entity';
import { Inject } from '@nestjs/common';

export class CreatePostCommand {
  constructor(public postInputModel: PostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, AppResultType<number>>
{
  constructor(
    private readonly blogService: BlogService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly postRepository: PostRepository,
    @Inject(Post.name) private readonly postEntity: typeof Post,
  ) {}
  async execute(command: CreatePostCommand): Promise<AppResultType<number>> {
    const blog: AppResultType<Blog | null> = await this.blogService.getBlogById(
      command.postInputModel.blogId,
    );
    if (blog.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    const date = new Date();
    const post: Post = this.postEntity.createPost(
      command.postInputModel,
      date,
      blog.data,
    );
    const result: number = await this.postRepository.save(post);
    return this.applicationObjectResult.success(result);
  }
}
