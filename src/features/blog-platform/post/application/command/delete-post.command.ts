import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { PostRepository } from '../../infrastructure/post-repositories';
import { PostService } from '../post-service';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { PostType } from '../../domain/post.entity';

export class DeletePostByIdCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdHandler
  implements ICommandHandler<DeletePostByIdCommand, AppResultType>
{
  constructor(
    private readonly postService: PostService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly postRepository: PostRepository,
  ) {}
  async execute(command: DeletePostByIdCommand): Promise<AppResultType> {
    const post: AppResultType<PostType | null> =
      await this.postService.getPostById(command.id);
    if (post.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    await this.postRepository.delete(post.data.id);
    return this.applicationObjectResult.success(null);
  }
}
