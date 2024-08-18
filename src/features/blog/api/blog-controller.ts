import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { apiPrefixSettings } from '../../../settings/app-prefix-settings';
import { BlogService } from '../application/blog-service';
import { BlogQueryRepository } from '../infrastructure/blog-query-repositories';
import { AppResultType } from '../../../base/types/types';
import { AppResult } from '../../../base/enum/app-result.enum';
import {
  BlogInputModel,
  BlogSortingQuery,
  BlogUpdateModel,
  PostBlogInputModel,
} from './models/input/blog-input.model';
import { BlogOutputModel } from './models/output/blog-output.model';
import { BasePagination } from '../../../base/pagination/base-pagination';
import { PostInputModel } from '../../post/api/models/input/post-input.model';
import { PostOutputModel } from '../../post/api/models/output/post-output.model';
import { PostService } from '../../post/application/post-service';
import { PostQueryRepository } from '../../post/infrastructure/post-query-repositories';
import { BaseSorting } from '../../../base/sorting/base-sorting';

@Controller(apiPrefixSettings.BLOG.blogs)
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly postService: PostService,
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  @Get(`:id/${apiPrefixSettings.BLOG.posts}`)
  async getPostByBlogId(
    @Query() query: BaseSorting,
    @Param('id') id: string,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    return await this.postQueryRepository.getPosts(query, id);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogOutputModel> {
    return await this.blogQueryRepository.getBlogById(id);
  }

  @Get()
  async getBlogs(
    @Query() query: BlogSortingQuery,
  ): Promise<BasePagination<BlogOutputModel[] | []>> {
    return await this.blogQueryRepository.getBlogs(query);
  }

  @Post(`:id/${apiPrefixSettings.BLOG.posts}`)
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() inputModel: PostBlogInputModel,
  ): Promise<PostOutputModel> {
    const postInputModel: PostInputModel = { ...inputModel, blogId: id };
    const result: AppResultType<string> =
      await this.postService.createPostByBlogId(postInputModel);
    switch (result.appResult) {
      case AppResult.Success:
        return await this.postQueryRepository.getPostById(result.data);
      case AppResult.NotFound:
        throw new NotFoundException('Blog not found');
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post()
  async createBlog(
    @Body() inputModel: BlogInputModel,
  ): Promise<BlogOutputModel> {
    const result: AppResultType<string> =
      await this.blogService.createBlog(inputModel);
    switch (result.appResult) {
      case AppResult.Success:
        return await this.blogQueryRepository.getBlogById(result.data);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string): Promise<void> {
    const result: AppResultType = await this.blogService.deleteBlogById(id);
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Blog not found');
      default:
        throw new InternalServerErrorException();
    }
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') id: string,
    @Body() updateModel: BlogUpdateModel,
  ): Promise<void> {
    const result: AppResultType = await this.blogService.updateBlogById(
      id,
      updateModel,
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Blog not found');
      default:
        throw new InternalServerErrorException();
    }
  }
}
