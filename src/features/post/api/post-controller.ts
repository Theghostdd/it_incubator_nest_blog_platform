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
  UseGuards,
} from '@nestjs/common';
import { PostQueryRepository } from '../infrastructure/post-query-repositories';
import { PostOutputModel } from './models/output/post-output.model';
import { BaseSorting } from '../../../base/sorting/base-sorting';
import { BasePagination } from '../../../base/pagination/base-pagination';
import {
  PostInputModel,
  PostUpdateModel,
} from './models/input/post-input.model';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../base/types/types';
import { AppResult } from '../../../base/enum/app-result.enum';
import { CommentOutputModel } from '../../comment/api/model/output/comment-output.model';
import { CommentQueryRepositories } from '../../comment/infrastructure/comment-query-repositories';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/command/create-post.command';
import { DeletePostByIdCommand } from '../application/command/delete-post.command';
import { UpdatePostByIdCommand } from '../application/command/update-post.command';
import { BasicGuard } from '../../../core/guards/basic/basic.guard';
import { CommentInputModel } from '../../comment/api/model/input/comment-input.model';
import { CreateCommentByPostIdCommand } from '../../comment/application/command/create-comment';
import { AuthJWTAccessGuard } from '../../../core/guards/jwt/jwt.guard';
import { CurrentUser } from '../../../core/decorators/current-user';

@Controller(apiPrefixSettings.POST.posts)
export class PostController {
  constructor(
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commentQueryRepository: CommentQueryRepositories,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(`:id/${apiPrefixSettings.POST.comments}`)
  async getCommentsByPostId(
    @Param('id') id: string,
    @Query() query: BaseSorting,
  ): Promise<BasePagination<CommentOutputModel[] | []>> {
    return await this.commentQueryRepository.getCommentsByPostId(query, id);
  }

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
  @UseGuards(BasicGuard)
  async createPost(
    @Body() inputModel: PostInputModel,
  ): Promise<PostOutputModel> {
    const result: AppResultType<string> = await this.commandBus.execute(
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
  async deletePostById(@Param('id') id: string): Promise<void> {
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
    @Param('id') id: string,
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
    @Param('id') id: string,
    @Body() inputCommentModel: CommentInputModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<CommentOutputModel> {
    const result: AppResultType<string> = await this.commandBus.execute(
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
}
