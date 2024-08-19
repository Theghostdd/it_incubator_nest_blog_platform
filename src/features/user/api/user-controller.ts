import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../application/user-service';
import {
  UserInputModel,
  UserSortingQuery,
} from './models/input/user-input.model';
import { apiPrefixSettings } from '../../../settings/app-prefix-settings';
import { UserQueryRepositories } from '../infrastructure/user-query-repositories';
import { UserOutputModel } from './models/output/user-output.model';
import { AppResult } from '../../../base/enum/app-result.enum';
import { BasePagination } from '../../../base/pagination/base-pagination';
import { AppResultType } from '../../../base/types/types';
import { BasicGuard } from '../../../infrastructure/guards/basic/basic.guard';
@UseGuards(BasicGuard)
@Controller(apiPrefixSettings.USER_PREFIX.user)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepositories: UserQueryRepositories,
  ) {}

  @Get()
  async getUsers(
    @Query() query: UserSortingQuery,
  ): Promise<BasePagination<UserOutputModel[] | []>> {
    return await this.userQueryRepositories.getUsers(query);
  }
  @Post()
  async createUser(
    @Body() userInputModel: UserInputModel,
  ): Promise<UserOutputModel> {
    const result: AppResultType<string> =
      await this.userService.createUser(userInputModel);
    console.log(result);
    switch (result.appResult) {
      case AppResult.Success:
        return await this.userQueryRepositories.getUserById(result.data);
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField.errorsMessages);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const result: AppResultType = await this.userService.deleteUser(id);

    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException('User not found');
      default:
        throw new InternalServerErrorException();
    }
  }
}
