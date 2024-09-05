import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocumentType,
  BlogModelType,
} from '../../domain/blog.entity';
import { AppResultType } from '../../../../../base/types/types';
import { BlogInputModel } from '../../api/models/input/blog-input.model';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';

export class CreateBlogCommand {
  constructor(public blogInputModel: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler
  implements ICommandHandler<CreateBlogCommand, AppResultType<string>>
{
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
  ) {}
  async execute(command: CreateBlogCommand): Promise<AppResultType<string>> {
    const blog: BlogDocumentType = this.blogModel.createBlogInstance(
      command.blogInputModel,
    );
    await this.blogRepository.save(blog);
    return this.applicationObjectResult.success(blog._id.toString());
  }
}
