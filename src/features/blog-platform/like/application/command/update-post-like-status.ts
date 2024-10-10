import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostService } from '../../../post/application/post-service';
import { LikeInputModel } from '../../api/models/input/like-input-model';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { Post } from '../../../post/domain/post.entity';
import { UserService } from '../../../../users/user/application/user-service';
import { User } from '../../../../users/user/domain/user.entity';
import { PostLikeService } from '../post-like-service';
import { Inject } from '@nestjs/common';
import { PostLikeRepositories } from '../../infrastructure/post-like-repositories';
import { PostLike } from '../../domain/post-like.entity';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: number,
    public userId: number,
    public likeInputModel: LikeInputModel,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusHandler
  implements ICommandHandler<UpdatePostLikeStatusCommand, AppResultType>
{
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly postLikeRepositories: PostLikeRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly postLikeService: PostLikeService,
    @Inject(PostLike.name)
    private readonly postLikeEntity: typeof PostLike,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<AppResultType> {
    const { postId, userId } = command;
    const post: AppResultType<Post | null> =
      await this.postService.getPostById(postId);
    if (post.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();
    const user: AppResultType<User | null> =
      await this.userService.getUserById(userId);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();

    const like: AppResultType<PostLike | null> =
      await this.postLikeService.getLikeByUserIdAndParentId(userId, postId);
    const date: Date = new Date();
    if (like.appResult !== AppResult.Success) {
      const newLike: PostLike = this.postLikeEntity.createLike(
        command.likeInputModel,
        post.data,
        user.data,
        date,
        date,
      );
      await this.postLikeRepositories.save(newLike);

      return this.applicationObjectResult.success(null);
    }

    like.data.updateLikeStatus(command.likeInputModel, date);
    await this.postLikeRepositories.save(like.data);
    return this.applicationObjectResult.success(null);
  }
}
