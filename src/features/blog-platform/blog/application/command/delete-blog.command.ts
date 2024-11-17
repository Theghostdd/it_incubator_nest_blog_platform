import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { BlogService } from '../blog-service';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { Blog } from '../../domain/blog.entity';

export class DeleteBlogByIdCommand {
  constructor(
    public id: number,
    public isAdmin: boolean,
    public userId?: number,
  ) {}
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
    const { id, userId, isAdmin } = command;
    const blog: AppResultType<Blog | null> =
      await this.blogService.getBlogById(id);

    if (blog.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    if (!isAdmin) {
      if (blog.data.ownerId !== userId)
        return this.applicationObjectResult.forbidden();
    }

    blog.data.deleteBlog();
    await this.blogRepository.save(blog.data);
    return this.applicationObjectResult.success(null);
  }
}
