import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../../base/types/types';
import { BlogRepository } from '../../infrastructure/blog-repositories';
import { BlogUserBanInputModel } from '../../api/models/input/blog-user-ban-input.model';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';
import { BlogBannedUserEntity } from '../../domain/blog-banned-user.entity';
import { Inject } from '@nestjs/common';
import { BlogBannedUserRepositories } from '../../infrastructure/blog-banned-user-repositories';

export class BloggerBanUserCommand implements ICommand {
  constructor(
    public userId: number,
    public inputModel: BlogUserBanInputModel,
    public bloggerId: number,
  ) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserHandler
  implements ICommandHandler<BloggerBanUserCommand, AppResultType<null>>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly blogRepository: BlogRepository,
    private readonly userRepository: UserRepositories,
    @Inject(BlogBannedUserEntity.name)
    private readonly blogBannedUserEntity: typeof BlogBannedUserEntity,
    private readonly blogBannedUserRepositories: BlogBannedUserRepositories,
  ) {}
  async execute(command: BloggerBanUserCommand): Promise<AppResultType<null>> {
    const { userId, inputModel, bloggerId } = command;
    const { isBanned, banReason, blogId: blogIdString } = inputModel;
    const blogId = Number(blogIdString);
    try {
      if (isNaN(blogId)) return this.applicationObjectResult.notFound();
      const [blog, user] = await Promise.all([
        this.blogRepository.getBlogById(blogId),
        this.userRepository.getUserByIdWithBanInfoForSpecialBlog(
          userId,
          blogId,
        ),
      ]);

      if (!user || !blog) return this.applicationObjectResult.notFound();
      if (blog.ownerId !== bloggerId)
        return this.applicationObjectResult.forbidden();
      if (userId === blog.ownerId)
        return this.applicationObjectResult.forbidden();

      let entity: BlogBannedUserEntity;

      if (!user.blogBanned || user.blogBanned.length === 0) {
        entity = this.blogBannedUserEntity.create(
          blogId,
          userId,
          banReason,
          isBanned,
        );
      } else {
        entity = user.blogBanned[0];
        entity.banOrUnban(isBanned, banReason);
      }

      await this.blogBannedUserRepositories.save(entity);
      return this.applicationObjectResult.success(null);
    } catch (e) {
      console.log('Ban/unban user error: ', e);
      return this.applicationObjectResult.internalServerError();
    }
  }
}
