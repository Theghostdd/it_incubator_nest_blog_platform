import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocumentType, PostModelType } from '../domain/post.entity';
import {
  PostInputModel,
  PostUpdateModel,
} from '../api/models/input/post-input.model';
import { AppResultType } from '../../../base/types/types';
import { AppResult } from '../../../base/enum/app-result.enum';
import { BlogDocumentType } from '../../blog/domain/blog.entity';
import { BlogRepository } from '../../blog/infrastructure/blog-repositories';
import { PostRepository } from '../infrastructure/post-repositories';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
    @InjectModel(Post.name) private readonly postModel: PostModelType,
  ) {}

  async createPostByBlogId(
    postInputModel: PostInputModel,
  ): Promise<AppResultType<string>> {
    const blog: BlogDocumentType | null = await this.blogRepository.getBlogById(
      postInputModel.blogId,
    );
    if (!blog) return { appResult: AppResult.NotFound, data: null };

    const post: PostDocumentType = this.postModel.createPostInstance(
      postInputModel,
      blog.name,
    );

    await this.postRepository.save(post);
    return { appResult: AppResult.Success, data: post._id.toString() };
  }

  async deletePostById(id: string): Promise<AppResultType> {
    const post: PostDocumentType = await this.postRepository.getPostById(id);
    if (!post) return { appResult: AppResult.NotFound, data: null };

    await this.postRepository.delete(post);
    return { appResult: AppResult.Success, data: null };
  }

  async updatePostById(
    id: string,
    postUpdateModel: PostUpdateModel,
  ): Promise<AppResultType> {
    const post: PostDocumentType = await this.postRepository.getPostById(id);
    if (!post) return { appResult: AppResult.NotFound, data: null };

    post.updatePostInstance(postUpdateModel);
    await this.postRepository.save(post);
    return { appResult: AppResult.Success, data: null };
  }
}
