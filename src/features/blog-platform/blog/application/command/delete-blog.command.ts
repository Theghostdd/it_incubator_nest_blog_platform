import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { BlogService } from '../blog-service';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { Blog } from '../../domain/blog.entity';

export class DeleteBlogByIdCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdHandler
  implements ICommandHandler<DeleteBlogByIdCommand, AppResultType>
{
  constructor(
    private readonly blogService: BlogService,
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(command: DeleteBlogByIdCommand): Promise<AppResultType> {
    const blog: AppResultType<Blog | null> = await this.blogService.getBlogById(
      command.id,
    );
    if (blog.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    blog.data.deleteBlog();
    await this.blogRepository.save(blog.data);
    return this.applicationObjectResult.success(null);
  }
}
