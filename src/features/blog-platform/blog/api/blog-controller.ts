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
  UseGuards,
} from '@nestjs/common';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { BlogQueryRepository } from '../infrastructure/blog-query-repositories';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { AppResult } from '../../../../base/enum/app-result.enum';
import {
  BlogInputModel,
  BlogSortingQuery,
  BlogUpdateModel,
  PostBlogInputModel,
} from './models/input/blog-input.model';
import { BlogOutputModel } from './models/output/blog-output.model';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { PostInputModel } from '../../post/api/models/input/post-input.model';
import { PostOutputModel } from '../../post/api/models/output/post-output.model';
import { PostQueryRepository } from '../../post/infrastructure/post-query-repositories';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../../post/application/command/create-post.command';
import { CreateBlogCommand } from '../application/command/create-blog.command';
import { DeleteBlogByIdCommand } from '../application/command/delete-blog.command';
import { UpdateBlogByIdCommand } from '../application/command/update-blog.command';
import { BasicGuard } from '../../../../core/guards/basic/basic.guard';
import { VerifyUserGuard } from '../../../../core/guards/jwt/jwt-verify-user';
import { CurrentUser } from '../../../../core/decorators/current-user';

@Controller(apiPrefixSettings.BLOG.blogs)
export class BlogController {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(`:id/${apiPrefixSettings.BLOG.posts}`)
  @UseGuards(VerifyUserGuard)
  async getPostByBlogId(
    @Query() query: BaseSorting,
    @Param('id') id: string,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    return await this.postQueryRepository.getPosts(query, id, user.userId);
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
  @UseGuards(BasicGuard)
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() inputModel: PostBlogInputModel,
  ): Promise<PostOutputModel> {
    const postInputModel: PostInputModel = { ...inputModel, blogId: id };
    const result: AppResultType<string> = await this.commandBus.execute(
      new CreatePostCommand(postInputModel),
    );
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
  @UseGuards(BasicGuard)
  async createBlog(
    @Body() inputModel: BlogInputModel,
  ): Promise<BlogOutputModel> {
    const result: AppResultType<string> = await this.commandBus.execute(
      new CreateBlogCommand(inputModel),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return await this.blogQueryRepository.getBlogById(result.data);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeleteBlogByIdCommand(id),
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

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updateBlogById(
    @Param('id') id: string,
    @Body() updateModel: BlogUpdateModel,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new UpdateBlogByIdCommand(id, updateModel),
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
