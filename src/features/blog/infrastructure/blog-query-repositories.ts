import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocumentType, BlogModelType } from '../domain/blog.entity';
import {
  BlogMapperOutputModel,
  BlogOutputModel,
} from '../api/models/output/blog-output.model';
import { SortOrder } from 'mongoose';
import { BasePagination } from '../../../base/pagination/base-pagination';
import { BlogSortingQuery } from '../api/models/input/blog-input.model';

@Injectable()
export class BlogQueryRepository {
  constructor(
    private readonly blogMapperOutputModel: BlogMapperOutputModel,
    private readonly blogSortingQuery: BlogSortingQuery,
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
  ) {}

  async getBlogById(id: string): Promise<BlogOutputModel> {
    const blog: BlogDocumentType | null = await this.blogModel.findOne({
      _id: id,
    });
    if (blog) {
      return this.blogMapperOutputModel.blogModel(blog);
    }
    throw new NotFoundException('User not found');
  }

  async getBlogs(
    query: BlogSortingQuery,
  ): Promise<BasePagination<BlogOutputModel[] | []>> {
    const { sortBy, sortDirection, searchNameTerm, pageSize, pageNumber } =
      this.blogSortingQuery.createBlogQuery(query);

    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortDirection as SortOrder,
    };
    const filter = { name: { $regex: searchNameTerm, $options: 'i' } };

    const getTotalDocument: number =
      await this.blogModel.countDocuments(filter);

    const totalCount: number = +getTotalDocument;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (+pageNumber - 1) * pageSize;

    const blogs: BlogDocumentType[] | [] = await this.blogModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

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
