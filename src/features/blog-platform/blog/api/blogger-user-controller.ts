import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiErrorsMessageModel,
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../../base/types/types';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import { EntityId } from '../../../../core/decorators/entityId';
import { CurrentUser } from '../../../../core/decorators/current-user';
import {
  BlogBannedUserSortingQuery,
  BlogUserBanInputModel,
} from './models/input/blog-user-ban-input.model';
import { BloggerBanUserCommand } from '../application/command/blogger-ban-user.command';
import {
  BlogBloggerBannedUserOutputModel,
  PaginationBlogBloggerBannedUserOutputModel,
} from './models/output/blog-blogger-banned-user-output.model';
import { BlogBannedUserQueryRepositories } from '../infrastructure/blog-banned-user-query-repositories';
import { BasePagination } from '../../../../base/pagination/base-pagination';

@ApiTags('Blogger - user')
@ApiBearerAuth()
@UseGuards(AuthJWTAccessGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller(`${apiPrefixSettings.BLOG.blogger}/${apiPrefixSettings.BLOG.user}`)
export class BloggerUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogBannedUserQueryRepositories: BlogBannedUserQueryRepositories,
  ) {}

  @Put(`:id/${apiPrefixSettings.BLOG.ban}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Success' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiNotFoundResponse({ description: 'Blog or user not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiParam({ name: 'id' })
  async banOrUnbanUser(
    @EntityId('id') id: number,
    @Body() body: BlogUserBanInputModel,
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<void> {
    const result: AppResultType<null> = await this.commandBus.execute(
      new BloggerBanUserCommand(id, body, user.userId),
    );

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.Forbidden:
        throw new ForbiddenException();
      case AppResult.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(`${apiPrefixSettings.BLOG.blog}/:id`)
  @ApiOkResponse({
    description: 'Success',
    type: PaginationBlogBloggerBannedUserOutputModel,
  })
  @ApiNotFoundResponse({ description: 'Blog not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiParam({ name: 'id' })
  async getBannedUsers(
    @EntityId('id') id: number,
    @CurrentUser() user: JWTAccessTokenPayloadType,
    @Query() query: BlogBannedUserSortingQuery,
  ): Promise<BasePagination<BlogBloggerBannedUserOutputModel[]>> {
    return await this.blogBannedUserQueryRepositories.getBannedUsersForSpecialBlog(
      id,
      user.userId,
      query,
    );
  }
}
