import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApiErrorMessageModel,
  AppResultType,
} from '../../../../../base/types/types';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { Inject } from '@nestjs/common';
import { Blog } from '../../domain/blog.entity';

export class BindBlogForUserCommand {
  constructor(
    public blogId: number,
    public userId: number,
  ) {}
}

@CommandHandler(BindBlogForUserCommand)
export class BindBlogForUserHandler
  implements
    ICommandHandler<
      BindBlogForUserCommand,
      AppResultType<null, ApiErrorMessageModel>
    >
{
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @Inject(Blog.name) private readonly blogEntity: typeof Blog,
  ) {}
  async execute(
    command: BindBlogForUserCommand,
  ): Promise<AppResultType<null, ApiErrorMessageModel>> {
    const { blogId, userId } = command;
    const blog: Blog | null = await this.blogRepository.getBlogById(blogId);

    if (!blog) return this.applicationObjectResult.notFound();
    if (blog.ownerId)
      return this.applicationObjectResult.badRequest({
        message: 'Blog already bound to any user',
        field: 'user',
      });

    blog.bindBlog(userId);
    await this.blogRepository.save(blog);
    return this.applicationObjectResult.success(null);
  }
}
