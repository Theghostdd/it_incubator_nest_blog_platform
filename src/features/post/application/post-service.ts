import { Injectable } from '@nestjs/common';
import { PostDocumentType } from '../domain/post.entity';
import { AppResultType } from '../../../base/types/types';
import { PostRepository } from '../infrastructure/post-repositories';
import { ApplicationObjectResult } from '../../../base/application-object-result/application-object-result';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  // async createPostByBlogId(
  //   postInputModel: PostInputModel,
  // ): Promise<AppResultType<string>> {
  //   const blog: BlogDocumentType | null = await this.blogRepository.getBlogById(
  //     postInputModel.blogId,
  //   );
  //   if (!blog) return { appResult: AppResult.NotFound, data: null };
  //
  //   const post: PostDocumentType = this.postModel.createPostInstance(
  //     postInputModel,
  //     blog.name,
  //   );
  //
  //   await this.postRepository.save(post);
  //   return { appResult: AppResult.Success, data: post._id.toString() };
  // }

  // async deletePostById(id: string): Promise<AppResultType> {
  //   const post: PostDocumentType = await this.postRepository.getPostById(id);
  //   if (!post) return { appResult: AppResult.NotFound, data: null };
  //
  //   await this.postRepository.delete(post);
  //   return { appResult: AppResult.Success, data: null };
  // }

  // async updatePostById(
  //   id: string,
  //   postUpdateModel: PostUpdateModel,
  // ): Promise<AppResultType> {
  //   const post: PostDocumentType = await this.postRepository.getPostById(id);
  //   if (!post) return { appResult: AppResult.NotFound, data: null };
  //
  //   post.updatePostInstance(postUpdateModel);
  //   await this.postRepository.save(post);
  //   return { appResult: AppResult.Success, data: null };
  // }

  async postIsExistById(
    id: string,
  ): Promise<AppResultType<PostDocumentType | null>> {
    const post: PostDocumentType = await this.postRepository.getPostById(id);
    if (!post) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(post);
  }
}
