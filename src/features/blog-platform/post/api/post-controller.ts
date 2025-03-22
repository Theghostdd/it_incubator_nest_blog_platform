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
import { PostQueryRepository } from '../infrastructure/post-query-repositories';
import {
  PostOutputModel,
  PostOutputModelForSwagger,
} from './models/output/post-output.model';
import {
  PostInputModel,
  PostUpdateModel,
} from './models/input/post-input.model';
import {
  CommentOutputModel,
  CommentOutputModelForSwagger,
} from '../../comment/api/model/output/comment-output.model';
import { CommentQueryRepositories } from '../../comment/infrastructure/comment-query-repositories';
import { CommandBus } from '@nestjs/cqrs';
import { DeletePostByIdCommand } from '../application/command/delete-post.command';
import { UpdatePostByIdCommand } from '../application/command/update-post.command';
import { CommentInputModel } from '../../comment/api/model/input/comment-input.model';
import { CreateCommentByPostIdCommand } from '../../comment/application/command/create-comment';
import { LikeInputModel } from '../../like/api/models/input/like-input-model';
import { UpdatePostLikeStatusCommand } from '../../like/application/command/update-post-like-status';
import { CreatePostCommand } from '../application/command/create-post.command';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { VerifyUserGuard } from '../../../../core/guards/jwt/jwt-verify-user';
import { EntityId } from '../../../../core/decorators/entityId';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { CurrentUser } from '../../../../core/decorators/current-user';
import {
  ApiErrorsMessageModel,
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { BasicGuard } from '../../../../core/guards/basic/basic.guard';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Post public api')
@Controller(apiPrefixSettings.POST.posts)
export class PostController {
  constructor(
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commentQueryRepository: CommentQueryRepositories,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiParam({ name: 'id' })
  @ApiOkResponse({
    description: 'Get all comments for post by post id',
    type: CommentOutputModelForSwagger,
  })
  @ApiNotFoundResponse({ description: 'If the post not found' })
  @ApiOperation({
    summary: 'Get all comments for post by post id',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for check user like status, only verify user.',
  })
  @Get(`:id/${apiPrefixSettings.POST.comments}`)
  @UseGuards(VerifyUserGuard)
  async getCommentsByPostId(
    @EntityId() id: string,
    @Query() query: BaseSorting,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<CommentOutputModel[] | []>> {
    return await this.commentQueryRepository.getCommentsByPostId(
      query,
      id,
      user.userId,
    );
  }

  @ApiParam({ name: 'id' })
  @ApiOkResponse({
    description: 'Get the post by id',
    type: PostOutputModel,
  })
  @ApiNotFoundResponse({ description: 'If the post not found' })
  @ApiOperation({
    summary: 'Get the post by id',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for check user like status, only verify user.',
  })
  @Get(':id')
  @UseGuards(VerifyUserGuard)
  async getPostById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<PostOutputModel> {
    return await this.postQueryRepository.getPostById(id, user?.userId || null);
  }

  @ApiOkResponse({
    description: 'Get all posts',
    type: PostOutputModelForSwagger,
  })
  @ApiOperation({
    summary: 'Get all posts',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for check user like status, only verify user.',
  })
  @Get()
  @UseGuards(VerifyUserGuard)
  async getPosts(
    @Query() query: BaseSorting,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    return await this.postQueryRepository.getPosts(
      query,
      null,
      user?.userId || null,
    );
  }

  @ApiBasicAuth()
  @ApiCreatedResponse({
    description: 'Create and return new post',
    type: PostOutputModel,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Login and password incorrect',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'If the blog not found' })
  @ApiOperation({
    summary: 'Create new post',
  })
  @Post()
  @UseGuards(BasicGuard)
  async createPost(
    @Body() inputModel: PostInputModel,
  ): Promise<PostOutputModel> {
    const result: AppResultType<number> = await this.commandBus.execute(
      new CreatePostCommand(inputModel, true),
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

  @ApiParam({ name: 'id' })
  @ApiBasicAuth()
  @ApiResponse({
    status: 204,
    description: 'Delete the post by id',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Login and password incorrect',
  })
  @ApiNotFoundResponse({ description: 'If the post not found' })
  @ApiOperation({
    summary: 'Delete the post by id',
  })
  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deletePostById(@EntityId() id: number): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeletePostByIdCommand(id, true),
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

  @ApiParam({ name: 'id' })
  @ApiBasicAuth()
  @ApiResponse({
    status: 204,
    description: 'Update the post by id',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Login and password incorrect',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'If the post not found' })
  @ApiOperation({
    summary: 'Update the post by id',
  })
  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updatePostById(
    @EntityId('id') id: number,
    @Body() updateModel: PostUpdateModel,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new UpdatePostByIdCommand(id, updateModel, true),
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

  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Create and return the comment by post id',
    type: CommentOutputModel,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token not found or incorrect',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'If the the post not found' })
  @ApiOperation({
    summary: 'Create and return the comment by post id',
    description: 'The access token is stored in headers: "accessToken".',
  })
  @Post(`:id/${apiPrefixSettings.POST.comments}`)
  @UseGuards(AuthJWTAccessGuard)
  async createCommentByPostId(
    @EntityId() id: number,
    @Body() inputCommentModel: CommentInputModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<CommentOutputModel> {
    const result: AppResultType<number> = await this.commandBus.execute(
      new CreateCommentByPostIdCommand(inputCommentModel, id, user.userId),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return await this.commentQueryRepository.getCommentById(result.data);
      case AppResult.NotFound:
        throw new NotFoundException('Post or user not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Create or update the like status for post by post id',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token not found or incorrect',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'If the post not found' })
  @ApiOperation({
    summary: 'Create or update the like status for post by post id',
    description: 'The access token is stored in headers: "accessToken".',
  })
  @Put(`:id/${apiPrefixSettings.POST.like_status}`)
  @UseGuards(AuthJWTAccessGuard)
  @HttpCode(204)
  async updateLikeStatusForPost(
    @EntityId() id: number,
    @Body() likeInputModel: LikeInputModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ) {
    const result: AppResultType = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(id, user.userId, likeInputModel),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Post or user not found');
      default:
        throw new InternalServerErrorException();
    }
  }
}
