import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BlogMapperOutputModel,
  BlogOutputModel,
} from '../api/models/output/blog-output.model';
import { BlogSortingQuery } from '../api/models/input/blog-input.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import {
  Blog,
  BlogPropertyEnum,
  selectBlogProperty,
} from '../domain/blog.entity';

@Injectable()
export class BlogQueryRepository {
  constructor(
    private readonly blogMapperOutputModel: BlogMapperOutputModel,
    private readonly blogSortingQuery: BlogSortingQuery,
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}

  async getBlogById(id: number): Promise<BlogOutputModel> {
    const blog: Blog | null = await this.blogRepository.findOne({
      where: {
        [BlogPropertyEnum.id]: id,
        [BlogPropertyEnum.isActive]: true,
      },
      select: [
        BlogPropertyEnum.id,
        BlogPropertyEnum.name,
        BlogPropertyEnum.description,
        BlogPropertyEnum.websiteUrl,
        BlogPropertyEnum.createdAt,
        BlogPropertyEnum.isMembership,
      ],
    });

    if (blog) {
      return this.blogMapperOutputModel.blogModel(blog);
    }
    throw new NotFoundException('Blog not found');
  }

  async getBlogs(
    query: BlogSortingQuery,
  ): Promise<BasePagination<BlogOutputModel[] | []>> {
    const { sortBy, sortDirection, searchNameTerm, pageSize, pageNumber } =
      this.blogSortingQuery.createBlogQuery(query);

    const skip: number = (+pageNumber - 1) * pageSize;
    const [blogs, count]: [Blog[], number] = await this.blogRepository
      .createQueryBuilder('b')
      .select(selectBlogProperty)
      .where(`b.${BlogPropertyEnum.name} ILIKE :name`, {
        name: `%${searchNameTerm || ''}%`,
      })
      .andWhere({ [BlogPropertyEnum.isActive]: true })
      .orderBy(`"${sortBy}"`, sortDirection as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset(skip)
      .getManyAndCount();

    const totalCount: number = count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items:
        blogs.length > 0 ? this.blogMapperOutputModel.blogsModel(blogs) : [],
    };
  }
}
