import { Injectable } from '@nestjs/common';
import { PostDocumentType } from '../domain/post.entity';
import { AppResultType } from '../../../../base/types/types';
import { PostRepository } from '../infrastructure/post-repositories';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async postIsExistById(
    id: string,
  ): Promise<AppResultType<PostDocumentType | null>> {
    const post: PostDocumentType = await this.postRepository.getPostById(id);
    if (!post) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(post);
  }
}
