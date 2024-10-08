import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { PostRepository } from '../infrastructure/post-repositories';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../base/types/types';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async getPostById(id: number): Promise<AppResultType<Post | null>> {
    const post: Post = await this.postRepository.getPostById(id);
    if (!post) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(post);
  }
}
