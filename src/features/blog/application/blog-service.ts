import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infrastructure/blog-repositories';
import { AppResultType } from '../../../base/types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocumentType, BlogModelType } from '../domain/blog.entity';
import {
  BlogInputModel,
  BlogUpdateModel,
} from '../api/models/input/blog-input.model';
import { AppResult } from '../../../base/enum/app-result.enum';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
  ) {}

  async createBlog(
    blogInputModel: BlogInputModel,
  ): Promise<AppResultType<string>> {
    const blog: BlogDocumentType =
      this.blogModel.createBlogInstance(blogInputModel);

    await this.blogRepository.save(blog);
    return { appResult: AppResult.Success, data: blog._id.toString() };
  }

  async deleteBlogById(id: string): Promise<AppResultType> {
    const blog: BlogDocumentType = await this.blogRepository.getBlogById(id);
    if (!blog) return { appResult: AppResult.NotFound, data: null };

    await this.blogRepository.delete(blog);
    return { appResult: AppResult.Success, data: null };
  }

  async updateBlogById(
    id: string,
    blogUpdateModel: BlogUpdateModel,
  ): Promise<AppResultType> {
    const blog: BlogDocumentType = await this.blogRepository.getBlogById(id);
    if (!blog) return { appResult: AppResult.NotFound, data: null };

    blog.updateBlogInstance(blogUpdateModel);
    await this.blogRepository.save(blog);
    return { appResult: AppResult.Success, data: null };
  }
}
