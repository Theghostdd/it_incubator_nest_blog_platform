import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentQueryRepositories } from '../infrastructure/comment-query-repositories';
import { CommentOutputModel } from './model/output/comment-output.model';
import { CommentUpdateModel } from './model/input/comment-input.model';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/command/update-comment';
import { CurrentUser } from '../../../../core/decorators/current-user';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { DeleteCommentCommand } from '../application/command/delete-comment';
import { LikeInputModel } from '../../like/api/models/input/like-input-model';
import { UpdateCommentLikeStatusCommand } from '../../like/application/command/update-comment-like-status';
import { VerifyUserGuard } from '../../../../core/guards/jwt/jwt-verify-user';
import { EntityId } from '../../../../core/decorators/entityId';

@Controller(apiPrefixSettings.COMMENT.comments)
export class CommentController {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepositories,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(VerifyUserGuard)
  async getCommentById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<CommentOutputModel> {
    return await this.commentQueryRepository.getCommentById(id, user.userId);
  }

  @Put(':id')
  @UseGuards(AuthJWTAccessGuard)
  @HttpCode(204)
  async updateCommentById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
    @Body() commentUpdateModel: CommentUpdateModel,
  ) {
    const result: AppResultType = await this.commandBus.execute(
      new UpdateCommentCommand(id, user.userId, commentUpdateModel),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Comment not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @UseGuards(AuthJWTAccessGuard)
  @HttpCode(204)
  async deleteCommentById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ) {
    const result: AppResultType = await this.commandBus.execute(
      new DeleteCommentCommand(id, user.userId),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Comment not found');
      case AppResult.Forbidden:
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Put(`:id/${apiPrefixSettings.COMMENT.like_status}`)
  @HttpCode(204)
  @UseGuards(AuthJWTAccessGuard)
  async updateCommentLikeStatusByCommentId(
    @EntityId() id: number,
    @Body() likeInputModel: LikeInputModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(id, user.userId, likeInputModel),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('Comment not found');
      default:
        throw new InternalServerErrorException();
    }
  }
}
