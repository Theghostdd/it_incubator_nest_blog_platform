import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostService } from '../post-service';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { PostRepository } from '../../infrastructure/post-repositories';
import { AppResultType } from '../../../../base/types/types';
import { PostDocumentType } from '../../domain/post.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { PostUpdateModel } from '../../api/models/input/post-input.model';

export class UpdatePostByIdCommand {
  constructor(
    public id: string,
    public postUpdateModel: PostUpdateModel,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdateByIdHandler
  implements ICommandHandler<UpdatePostByIdCommand, AppResultType>
{
  constructor(
    private readonly postService: PostService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly postRepository: PostRepository,
  ) {}
  async execute(command: UpdatePostByIdCommand): Promise<AppResultType> {
    const post: AppResultType<PostDocumentType | null> =
      await this.postService.postIsExistById(command.id);
    if (post.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    post.data.updatePostInstance(command.postUpdateModel);

    await this.postRepository.save(post.data);
    return this.applicationObjectResult.success(null);
  }
}
