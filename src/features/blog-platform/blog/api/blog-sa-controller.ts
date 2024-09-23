import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostOutputModel } from '../../post/api/models/output/post-output.model';
import {
  PostInputModel,
  PostUpdateModel,
} from '../../post/api/models/input/post-input.model';
import { CreatePostCommand } from '../../post/application/command/create-post.command';
import { PostQueryRepository } from '../../post/infrastructure/post-query-repositories';
import { BlogQueryRepository } from '../infrastructure/blog-query-repositories';
import { DeletePostByIdCommand } from '../../post/application/command/delete-post.command';
import { UpdatePostByIdCommand } from '../../post/application/command/update-post.command';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { BasicGuard } from '../../../../core/guards/basic/basic.guard';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyUserGuard } from '../../../../core/guards/jwt/jwt-verify-user';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { EntityId } from '../../../../core/decorators/entityId';
import { CurrentUser } from '../../../../core/decorators/current-user';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import {
  BlogInputModel,
  BlogPostUpdateModel,
  BlogSortingQuery,
  BlogUpdateModel,
  PostBlogInputModel,
} from './models/input/blog-input.model';
import { BlogOutputModel } from './models/output/blog-output.model';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { UpdateBlogByIdCommand } from '../application/command/update-blog.command';
import { DeleteBlogByIdCommand } from '../application/command/delete-blog.command';
import { CreateBlogCommand } from '../application/command/create-blog.command';

@Controller(apiPrefixSettings.BLOG.sa_blogs)
@UseGuards(BasicGuard)
export class BlogAdminController {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(`:id/${apiPrefixSettings.BLOG.posts}`)
  @UseGuards(VerifyUserGuard)
  async getPostByBlogId(
    @Query() query: BaseSorting,
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    return await this.postQueryRepository.getPosts(
      query,
      id > 0 ? id : null,
      user.userId,
    );
  }

  @Get()
  async getBlogs(
    @Query() query: BlogSortingQuery,
  ): Promise<BasePagination<BlogOutputModel[] | []>> {
    return await this.blogQueryRepository.getBlogs(query);
  }

  @Post(`:id/${apiPrefixSettings.BLOG.posts}`)
  async createPostByBlogId(
    @EntityId() id: number,
    @Body() inputModel: PostBlogInputModel,
  ): Promise<PostOutputModel> {
    const postInputModel: PostInputModel = { ...inputModel, blogId: id };
    const result: AppResultType<number> = await this.commandBus.execute(
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
  async createBlog(
    @Body() inputModel: BlogInputModel,
  ): Promise<BlogOutputModel> {
    const result: AppResultType<number> = await this.commandBus.execute(
      new CreateBlogCommand(inputModel),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return await this.blogQueryRepository.getBlogById(result.data);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(`:id/${apiPrefixSettings.BLOG.posts}/:postId`)
  @HttpCode(204)
  async deletePostById(
    @EntityId('id') id: number,
    @EntityId('postId') postId: number,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeletePostByIdCommand(postId, id),
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

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@EntityId() id: number): Promise<void> {
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

  @Put(`:id/${apiPrefixSettings.BLOG.posts}/:postId`)
  @HttpCode(204)
  async updatePostById(
    @EntityId('id') id: number,
    @EntityId('postId') postId: number,
    @Body() updateModel: BlogPostUpdateModel,
  ): Promise<void> {
    const updatePostModel: PostUpdateModel = { ...updateModel, blogId: id };
    const result: AppResultType = await this.commandBus.execute(
      new UpdatePostByIdCommand(postId, updatePostModel),
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

  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @EntityId() id: number,
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
