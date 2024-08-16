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
} from './models/input/blog-input.model';
import { BlogOutputModel } from './models/output/blog-output.model';
import { BasePagination } from '../../../base/pagination/base-pagination';

@Controller(apiPrefixSettings.BLOG.blogs)
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

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
