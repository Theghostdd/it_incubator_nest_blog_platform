import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { BlogInputModel } from '../../api/models/input/blog-input.model';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { Blog, BlogFactory } from '../../domain/blog.entity';

export class CreateBlogCommand {
  constructor(public blogInputModel: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler
  implements ICommandHandler<CreateBlogCommand, AppResultType<number>>
{
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly blogFactory: BlogFactory,
  ) {}
  async execute(command: CreateBlogCommand): Promise<AppResultType<number>> {
    const blog: Blog = this.blogFactory.create(command.blogInputModel);

    const result: number = await this.blogRepository.save(blog);
    return this.applicationObjectResult.success(result);
  }
}
