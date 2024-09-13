import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infrastructure/blog-repositories';
import { AppResultType } from '../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { BlogType } from '../domain/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async getBlogById(id: number): Promise<AppResultType<BlogType | null>> {
    const blog: BlogType | null = await this.blogRepository.getBlogById(id);
    if (!blog) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(blog);
  }
}
