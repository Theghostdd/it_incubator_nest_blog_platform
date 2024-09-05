import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infrastructure/blog-repositories';
import { AppResultType } from '../../../../base/types/types';
import { BlogDocumentType } from '../domain/blog.entity';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  // async createBlog(
  //   blogInputModel: BlogInputModel,
  // ): Promise<AppResultType<string>> {
  //   const blog: BlogDocumentType =
  //     this.blogModel.createBlogInstance(blogInputModel);
  //
  //   await this.blogRepository.save(blog);
  //   return { appResult: AppResult.Success, data: blog._id.toString() };
  // }

  // async deleteBlogById(id: string): Promise<AppResultType> {
  //   const blog: BlogDocumentType = await this.blogRepository.getBlogById(id);
  //   if (!blog) return { appResult: AppResult.NotFound, data: null };
  //
  //   await this.blogRepository.delete(blog);
  //   return { appResult: AppResult.Success, data: null };
  // }

  // async updateBlogById(
  //   id: string,
  //   blogUpdateModel: BlogUpdateModel,
  // ): Promise<AppResultType> {
  //   const blog: BlogDocumentType = await this.blogRepository.getBlogById(id);
  //   if (!blog) return { appResult: AppResult.NotFound, data: null };
  //
  //   blog.updateBlogInstance(blogUpdateModel);
  //   await this.blogRepository.save(blog);
  //   return { appResult: AppResult.Success, data: null };
  // }

  async blogIsExistsById(
    id: string,
  ): Promise<AppResultType<BlogDocumentType | null>> {
    const blog: BlogDocumentType | null =
      await this.blogRepository.getBlogById(id);

    if (!blog) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(blog);
  }
}
