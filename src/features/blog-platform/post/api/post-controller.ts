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
import { PostQueryRepository } from '../infrastructure/post-query-repositories';
import { PostOutputModel } from './models/output/post-output.model';
import {
  PostInputModel,
  PostUpdateModel,
} from './models/input/post-input.model';
import { CommentOutputModel } from '../../comment/api/model/output/comment-output.model';
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
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { BasicGuard } from '../../../../core/guards/basic/basic.guard';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';

@Controller(apiPrefixSettings.POST.posts)
export class PostController {
  constructor(
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commentQueryRepository: CommentQueryRepositories,
    private readonly commandBus: CommandBus,
  ) {}

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

  @Get(':id')
  @UseGuards(VerifyUserGuard)
  async getPostById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<PostOutputModel> {
    return await this.postQueryRepository.getPostById(id, user?.userId || null);
  }

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

  @Post()
  @UseGuards(BasicGuard)
  async createPost(
    @Body() inputModel: PostInputModel,
  ): Promise<PostOutputModel> {
    const result: AppResultType<number> = await this.commandBus.execute(
      new CreatePostCommand(inputModel),
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

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deletePostById(@EntityId() id: number): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeletePostByIdCommand(id),
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
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updatePostById(
    @EntityId() id: number,
    @Body() updateModel: PostUpdateModel,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new UpdatePostByIdCommand(id, updateModel),
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
      default:
        throw new InternalServerErrorException();
    }
  }

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
