import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BlogMapperOutputModel,
  BlogOutputModel,
} from '../api/models/output/blog-output.model';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { BlogSortingQuery } from '../api/models/input/blog-input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogType } from '../domain/blog.entity';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class BlogQueryRepository {
  constructor(
    private readonly blogMapperOutputModel: BlogMapperOutputModel,
    private readonly blogSortingQuery: BlogSortingQuery,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getBlogById(id: number): Promise<BlogOutputModel> {
    const query = `
        SELECT "id", "name", "description", "websiteUrl", "isMembership", "createdAt"
        FROM ${tablesName.BLOGS}
        WHERE "id" = $1 AND "isActive" = true
     `;
    const blog: BlogType[] | [] = await this.dataSource.query(query, [id]);
    if (blog.length > 0) {
      return this.blogMapperOutputModel.blogModel(blog[0]);
    }
    throw new NotFoundException('Blog not found');
  }

  async getBlogs(
    query: BlogSortingQuery,
  ): Promise<BasePagination<BlogOutputModel[] | []>> {
    const { sortBy, sortDirection, searchNameTerm, pageSize, pageNumber } =
      this.blogSortingQuery.createBlogQuery(query);

    const getTotalDocument: { count: number }[] = await this.dataSource.query(
      `SELECT COUNT(*) 
             FROM ${tablesName.BLOGS}
             WHERE ("name" ILIKE '%' || $1 || '%' OR $1 IS NULL)
             AND "isActive" = true
    `,
      [searchNameTerm],
    );
    const totalCount: number = +getTotalDocument[0].count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (+pageNumber - 1) * pageSize;

    const queryR = `
      SELECT "id", "name", "description", "websiteUrl", "isMembership", "createdAt"
      FROM ${tablesName.BLOGS}
      WHERE ("name" ILIKE '%' || $1 || '%' OR $1 IS NULL) 
      AND "isActive" = true
      ORDER BY $2 || $3
      LIMIT $4 OFFSET $5;
    `;
    const blogs: BlogType[] | [] = await this.dataSource.query(queryR, [
      searchNameTerm,
      sortBy,
      sortDirection,
      pageSize,
      skip,
    ]);

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
