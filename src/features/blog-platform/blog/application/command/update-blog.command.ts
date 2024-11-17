import { AppResultType } from '../../../../../base/types/types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogService } from '../blog-service';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { BlogUpdateModel } from '../../api/models/input/blog-input.model';
import { Blog } from '../../domain/blog.entity';

export class UpdateBlogByIdCommand {
  constructor(
    public id: number,
    public blogUpdateModel: BlogUpdateModel,
    public isAdmin: boolean,
    public userId?: number,
  ) {}
}

@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdHandler
  implements ICommandHandler<UpdateBlogByIdCommand, AppResultType>
{
  constructor(
    private readonly blogService: BlogService,
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(command: UpdateBlogByIdCommand): Promise<AppResultType> {
    const { userId, isAdmin, id } = command;
    const blog: AppResultType<Blog | null> =
      await this.blogService.getBlogById(id);
    if (blog.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    if (!isAdmin) {
      if (blog.data.ownerId !== userId)
        return this.applicationObjectResult.forbidden();
    }

    blog.data.updateBlog(command.blogUpdateModel);
    await this.blogRepository.save(blog.data);
    return this.applicationObjectResult.success(null);
  }
}
