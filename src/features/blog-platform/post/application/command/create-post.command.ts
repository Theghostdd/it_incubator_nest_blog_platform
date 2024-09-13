import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputModel } from '../../api/models/input/post-input.model';
import { AppResultType } from '../../../../../base/types/types';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { PostRepository } from '../../infrastructure/post-repositories';
import { BlogService } from '../../../blog/application/blog-service';
import { BlogType } from '../../../blog/domain/blog.entity';
import { Post, PostFactory } from '../../domain/post.entity';

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
    private readonly postFactory: PostFactory,
  ) {}
  async execute(command: CreatePostCommand): Promise<AppResultType<number>> {
    const blog: AppResultType<BlogType | null> =
      await this.blogService.getBlogById(command.postInputModel.blogId);
    if (blog.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    const post: Post = this.postFactory.create(
      command.postInputModel,
      blog.data.name,
    );

    const result: number = await this.postRepository.save(post);
    return this.applicationObjectResult.success(result);
  }
}
