import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  UserInputModel,
  UserSortingQuery,
} from './models/input/user-input.model';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { UserQueryRepositories } from '../infrastructure/user-query-repositories';
import { UserOutputModel } from './models/output/user-output.model';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import {
  APIErrorsMessageType,
  AppResultType,
} from '../../../../base/types/types';
import { BasicGuard } from '../../../../core/guards/basic/basic.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/command/create-user.command';
import { DeleteUserByIdCommand } from '../application/command/delete-user.command';
import { EntityId } from '../../../../core/decorators/entityId';
@UseGuards(BasicGuard)
@Controller(apiPrefixSettings.USER_PREFIX.user)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
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
    const result: AppResultType<number, APIErrorsMessageType> =
      await this.commandBus.execute(new CreateUserCommand(userInputModel));
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
  async deleteUser(@EntityId() id: number): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new DeleteUserByIdCommand(id),
    );

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
