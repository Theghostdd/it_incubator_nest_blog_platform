import { apiPrefixSettings } from '../../../settings/app-prefix-settings';
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
import { PostService } from '../application/post-service';
import { PostQueryRepository } from '../infrastructure/post-query-repositories';
import { PostOutputModel } from './models/output/post-output.model';
import { BaseSorting } from '../../../base/sorting/base-sorting';
import { BasePagination } from '../../../base/pagination/base-pagination';
import {
  PostInputModel,
  PostUpdateModel,
} from './models/input/post-input.model';
import { AppResultType } from '../../../base/types/types';
import { AppResult } from '../../../base/enum/app-result.enum';

@Controller(apiPrefixSettings.POST.posts)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<PostOutputModel> {
    return await this.postQueryRepository.getPostById(id);
  }

  @Get()
  async getPosts(
    @Query() query: BaseSorting,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    return await this.postQueryRepository.getPosts(query);
  }

  @Post()
  async createPost(
    @Body() inputModel: PostInputModel,
  ): Promise<PostOutputModel> {
    const result: AppResultType<string> =
      await this.postService.createPostByBlogId(inputModel);
    switch (result.appResult) {
      case AppResult.Success:
        return await this.postQueryRepository.getPostById(result.data);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePostById(@Param('id') id: string): Promise<void> {
    const result: AppResultType = await this.postService.deletePostById(id);
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Post not found');
      default:
        throw new InternalServerErrorException();
    }
  }

  @Put(':id')
  @HttpCode(204)
  async updatePostById(
    @Param('id') id: string,
    @Body() updateModel: PostUpdateModel,
  ): Promise<void> {
    const result: AppResultType = await this.postService.updatePostById(
      id,
      updateModel,
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Post not found');
      default:
        throw new InternalServerErrorException();
    }
  }
}
