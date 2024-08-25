import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputModel } from '../../api/models/input/post-input.model';
import { AppResultType } from '../../../../base/types/types';
import { BlogDocumentType } from '../../../blog/domain/blog.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import {
  Post,
  PostDocumentType,
  PostModelType,
} from '../../domain/post.entity';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { InjectModel } from '@nestjs/mongoose';
import { PostRepository } from '../../infrastructure/post-repositories';
import { BlogService } from '../../../blog/application/blog-service';

export class CreatePostCommand {
  constructor(public postInputModel: PostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, AppResultType<string>>
{
  constructor(
    private readonly blogService: BlogService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly postRepository: PostRepository,
    @InjectModel(Post.name) private readonly postModel: PostModelType,
  ) {}
  async execute(command: CreatePostCommand): Promise<AppResultType<string>> {
    const blog: AppResultType<BlogDocumentType | null> =
      await this.blogService.blogIsExistsById(command.postInputModel.blogId);
    if (blog.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    const post: PostDocumentType = this.postModel.createPostInstance(
      command.postInputModel,
      blog.data.name,
    );

    await this.postRepository.save(post);
    return this.applicationObjectResult.success(post._id.toString());
  }
}
