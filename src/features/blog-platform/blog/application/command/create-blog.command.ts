import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { BlogInputModel } from '../../api/models/input/blog-input.model';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { Blog } from '../../domain/blog.entity';
import { Inject } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(
    public blogInputModel: BlogInputModel,
    public userId?: number,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler
  implements ICommandHandler<CreateBlogCommand, AppResultType<number>>
{
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @Inject(Blog.name) private readonly blogEntity: typeof Blog,
  ) {}
  async execute(command: CreateBlogCommand): Promise<AppResultType<number>> {
    const blog: Blog = this.blogEntity.createBlog(
      command.blogInputModel,
      command.userId,
    );

    const result: number = await this.blogRepository.save(blog);
    return this.applicationObjectResult.success(result);
  }
}
