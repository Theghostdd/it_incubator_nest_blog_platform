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

  async getBlogById(
    id: string,
  ): Promise<AppResultType<BlogDocumentType | null>> {
    const blog: BlogDocumentType | null =
      await this.blogRepository.getBlogById(id);

    if (!blog) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(blog);
  }
}
