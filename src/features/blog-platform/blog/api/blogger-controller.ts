import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { BlogQueryRepository } from '../infrastructure/blog-query-repositories';
import { PostQueryRepository } from '../../post/infrastructure/post-query-repositories';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiErrorsMessageModel,
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import {
  BlogOutputModel,
  BlogOutputModelForSwagger,
} from './models/output/blog-output.model';
import {
  BlogInputModel,
  BlogPostUpdateModel,
  BlogSortingQuery,
  BlogUpdateModel,
  PostBlogInputModel,
} from './models/input/blog-input.model';
import { CreateBlogCommand } from '../application/command/create-blog.command';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import {
  PostOutputModel,
  PostOutputModelForSwagger,
} from '../../post/api/models/output/post-output.model';
import { EntityId } from '../../../../core/decorators/entityId';
import {
  PostInputModel,
  PostUpdateModel,
} from '../../post/api/models/input/post-input.model';
import { CreatePostCommand } from '../../post/application/command/create-post.command';
import { UpdateBlogByIdCommand } from '../application/command/update-blog.command';
import { DeleteBlogByIdCommand } from '../application/command/delete-blog.command';
import { DeletePostByIdCommand } from '../../post/application/command/delete-post.command';
import { UpdatePostByIdCommand } from '../../post/application/command/update-post.command';
import { CurrentUser } from '../../../../core/decorators/current-user';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { BasePagination } from '../../../../base/pagination/base-pagination';

@ApiTags('Blogger public api')
@ApiBearerAuth()
@UseGuards(AuthJWTAccessGuard)
@Controller(`${apiPrefixSettings.BLOG.blogger}/${apiPrefixSettings.BLOG.blogs}`)
export class BloggerController {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiParam({ name: 'blogId' })
  @ApiOkResponse({
    description: 'Return posts array or empty array',
    type: PostOutputModelForSwagger,
  })
  @ApiNotFoundResponse({ description: 'If the blog not found' })
  @ApiOperation({
    summary: 'Get all posts by blog id',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for check user like status, only verify user.',
  })
  @Get(`:id/${apiPrefixSettings.BLOG.posts}`)
  async getPostByBlogId(
    @Query() query: BaseSorting,
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    return await this.postQueryRepository.getPostsByBlogger(
      query,
      id,
      user.userId,
    );
  }

  @ApiOkResponse({
    description: 'Return all blogs or empty array',
    type: BlogOutputModelForSwagger,
  })
  @ApiNotFoundResponse({ description: 'If the blog not found' })
  @ApiOperation({
    summary: 'Get all blogs',
  })
  @Get()
  async getBlogs(
    @Query() query: BlogSortingQuery,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<BlogOutputModel[] | []>> {
    return await this.blogQueryRepository.getBloggerBlogs(query, user.userId);
  }

  // Create blog
  @ApiResponse({
    status: 201,
    description: 'Create and return new blog',
    type: BlogOutputModel,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiOperation({
    summary: 'Create new blog by super admin',
  })
  @Post()
  async createBlog(
    @Body() inputModel: BlogInputModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BlogOutputModel> {
    const result: AppResultType<number> = await this.commandBus.execute(
      new CreateBlogCommand(inputModel, user.userId),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return await this.blogQueryRepository.getBlogById(result.data);
      default:
        throw new InternalServerErrorException();
    }
  }

  // Create post by blog id
  @ApiParam({ name: 'blogId' })
  @ApiCreatedResponse({
    description: 'Create and return new post by blog id',
    type: PostOutputModel,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'If the blog not found' })
  @ApiOperation({
    summary: 'Create post by blog id',
  })
  @ApiForbiddenResponse({
    description:
      "If user try to add post to blog that doesn't belong to current user",
  })
  @Post(`:id/${apiPrefixSettings.BLOG.posts}`)
  async createPostByBlogId(
    @EntityId() id: number,
    @Body() inputModel: PostBlogInputModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<PostOutputModel> {
    const postInputModel: PostInputModel = { ...inputModel, blogId: id };
    const result: AppResultType<number> = await this.commandBus.execute(
      new CreatePostCommand(postInputModel, false, user.userId),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return await this.postQueryRepository.getPostById(result.data);
      case AppResult.NotFound:
        throw new NotFoundException('Blog not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  // Update blog by id
  @ApiParam({ name: 'blogId' })
  @ApiResponse({
    status: 204,
    description: 'Update the blog by id',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'If the blog not found' })
  @ApiOperation({
    summary: 'Update the blog by id',
  })
  @ApiForbiddenResponse({
    description:
      "If user try to update blog that doesn't belong to current user",
  })
  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @EntityId() id: number,
    @Body() updateModel: BlogUpdateModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new UpdateBlogByIdCommand(id, updateModel, false, user.userId),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Blog not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  // Update post by id
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'postId' })
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'If the blog or the post not found' })
  @ApiOperation({
    summary: 'Update the post by post and blog ids',
  })
  @ApiForbiddenResponse({
    description:
      "If user try to update post that belongs to blog that doesn't belong to current user",
  })
  @Put(`:id/${apiPrefixSettings.BLOG.posts}/:postId`)
  @HttpCode(204)
  async updatePostById(
    @EntityId('id') id: number,
    @EntityId('postId') postId: number,
    @Body() updateModel: BlogPostUpdateModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<void> {
    const updatePostModel: PostUpdateModel = { ...updateModel, blogId: id };
    const result: AppResultType = await this.commandBus.execute(
      new UpdatePostByIdCommand(postId, updatePostModel, false, user.userId),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Post not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  // Delete blog by id
  @ApiParam({ name: 'blogId' })
  @ApiResponse({
    status: 204,
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: 'If the blog not found' })
  @ApiOperation({
    summary: 'Delete blog by id',
  })
  @ApiForbiddenResponse({
    description:
      "If user try to delete blog that doesn't belong to current user",
  })
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeleteBlogByIdCommand(id, false, user.userId),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Blog not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  // Delete post by id and blog id
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'postId' })
  @ApiResponse({
    status: 204,
    description: 'Delete the post by post and blog ids',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: 'If the blog or the post not found' })
  @ApiOperation({
    summary: 'Delete the post by post and blog ids',
  })
  @ApiForbiddenResponse({
    description:
      "If user try to delete post that belongs to blog that doesn't belong to current user",
  })
  @Delete(`:id/${apiPrefixSettings.BLOG.posts}/:postId`)
  @HttpCode(204)
  async deletePostById(
    @EntityId('id') id: number,
    @EntityId('postId') postId: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeletePostByIdCommand(postId, false, id, user.userId),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Post not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
