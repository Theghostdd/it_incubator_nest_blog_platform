import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BlogMapperOutputModel,
  BlogOutputModel,
  BlogWithOwnerInfoOutputModel,
} from '../api/models/output/blog-output.model';
import { BlogSortingQuery } from '../api/models/input/blog-input.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { Blog } from '../domain/blog.entity';
import { BlogPropertyEnum, selectBlogProperty } from '../domain/types';
import { UserPropertyEnum } from '../../../users/user/domain/types';

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

  async getBloggerBlogs(
    query: BlogSortingQuery,
    userId: number,
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
      .andWhere(`b.${BlogPropertyEnum.ownerId} = :userId `, { userId })
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

  async getBlogsWithOwnerInfo(
    query: BlogSortingQuery,
  ): Promise<BasePagination<BlogWithOwnerInfoOutputModel[] | []>> {
    const { sortBy, sortDirection, searchNameTerm, pageSize, pageNumber } =
      this.blogSortingQuery.createBlogQuery(query);

    const skip: number = (+pageNumber - 1) * pageSize;
    const [blogs, count]: [Blog[], number] = await this.blogRepository
      .createQueryBuilder('b')
      .select(selectBlogProperty)
      .leftJoinAndSelect(
        `b.${BlogPropertyEnum.owner}`,
        'o',
        `o.${UserPropertyEnum.id} = b.${BlogPropertyEnum.ownerId}`,
      )
      .where(`b.${BlogPropertyEnum.name} ILIKE :name`, {
        name: `%${searchNameTerm || ''}%`,
      })
      .andWhere({ [BlogPropertyEnum.isActive]: true })
      .orderBy(`b."${sortBy}"`, sortDirection as 'ASC' | 'DESC')
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
        blogs.length > 0
          ? this.blogMapperOutputModel.blogsAdminModel(blogs)
          : [],
    };
  }
}
