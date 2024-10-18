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
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/command/update-comment';
import { DeleteCommentCommand } from '../application/command/delete-comment';
import { LikeInputModel } from '../../like/api/models/input/like-input-model';
import { UpdateCommentLikeStatusCommand } from '../../like/application/command/update-comment-like-status';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { VerifyUserGuard } from '../../../../core/guards/jwt/jwt-verify-user';
import { EntityId } from '../../../../core/decorators/entityId';
import { CurrentUser } from '../../../../core/decorators/current-user';
import {
  ApiErrorsMessageModel,
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import { AppResult } from '../../../../base/enum/app-result.enum';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Comments')
@Controller(apiPrefixSettings.COMMENT.comments)
export class CommentController {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepositories,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiParam({ name: 'id' })
  @ApiOkResponse({
    description: 'Get comment by id',
    type: CommentOutputModel,
  })
  @ApiNotFoundResponse({ description: 'If the comment not found' })
  @ApiOperation({
    summary: 'Get comment by id',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for verify current user and check like status.',
  })
  @Get(':id')
  @UseGuards(VerifyUserGuard)
  async getCommentById(
    @EntityId() id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<CommentOutputModel> {
    return await this.commentQueryRepository.getCommentById(id, user.userId);
  }

  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Success',
  })
  @ApiNotFoundResponse({ description: 'If the comment not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token not found or invalid',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiForbiddenResponse({ description: 'Forbidden: comment not current user' })
  @ApiOperation({
    summary: 'Update comment by id',
    description: 'The access token is stored in headers: "accessToken".',
  })
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

  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Comment was delete',
  })
  @ApiNotFoundResponse({ description: 'If the comment not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token not found or invalid',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: comment not current user' })
  @ApiOperation({
    summary: 'Delete comment by id',
    description: 'The access token is stored in headers: "accessToken".',
  })
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

  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Like was update or create',
  })
  @ApiNotFoundResponse({ description: 'If the comment not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token not found or invalid',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiOperation({
    summary: 'Update like or create for comment by comment id',
    description: 'The access token is stored in headers: "accessToken".',
  })
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
