import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { BlogDocumentType } from '../../domain/blog.entity';
import { BlogService } from '../blog-service';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class DeleteBlogByIdCommand {
  constructor(public id: string) {}
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
    const blog: AppResultType<BlogDocumentType | null> =
      await this.blogService.blogIsExistsById(command.id);
    if (blog.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    await this.blogRepository.delete(blog.data);
    return this.applicationObjectResult.success(null);
  }
}
