import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BlogQueryRepository } from '../infrastructure/blog-query-repositories';
import { BlogSortingQuery } from './models/input/blog-input.model';
import {
  BlogOutputModel,
  BlogOutputModelForSwagger,
} from './models/output/blog-output.model';
import {
  PostOutputModel,
  PostOutputModelForSwagger,
} from '../../post/api/models/output/post-output.model';
import { PostQueryRepository } from '../../post/infrastructure/post-query-repositories';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { VerifyUserGuard } from '../../../../core/guards/jwt/jwt-verify-user';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { EntityId } from '../../../../core/decorators/entityId';
import { CurrentUser } from '../../../../core/decorators/current-user';
import { JWTAccessTokenPayloadType } from '../../../../base/types/types';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Blog public api')
@Controller(apiPrefixSettings.BLOG.blogs)
export class BlogController {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
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
  @UseGuards(VerifyUserGuard)
  async getPostByBlogId(
    @Query() query: BaseSorting,
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    return await this.postQueryRepository.getPosts(query, id, user.userId);
  }

  @ApiOkResponse({
    description: 'Return blog',
    type: BlogOutputModel,
  })
  @ApiNotFoundResponse({ description: 'If the blog not found' })
  @ApiOperation({
    summary: 'Get blog by id',
  })
  @ApiParam({ name: 'blogId' })
  @Get(':id')
  async getBlogById(@EntityId() id: number): Promise<BlogOutputModel> {
    return await this.blogQueryRepository.getBlogById(id);
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
  ): Promise<BasePagination<BlogOutputModel[] | []>> {
    return await this.blogQueryRepository.getBlogs(query);
  }
}
