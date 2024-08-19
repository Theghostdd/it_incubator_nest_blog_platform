import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { apiPrefixSettings } from '../../../settings/app-prefix-settings';
import { AuthService } from '../application/auth-application';
import {
  LoginInputModel,
  RegistrationInputModel,
} from './models/input/auth-input.models';
import {
  AppResultType,
  AuthorizationUserResponseType,
} from '../../../base/types/types';
import { AppResult } from '../../../base/enum/app-result.enum';
import { UserQueryRepositories } from '../../user/infrastructure/user-query-repositories';

@Controller(apiPrefixSettings.AUTH.auth)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userQueryRepositories: UserQueryRepositories,
  ) {}

  @Post(`/${apiPrefixSettings.AUTH.login}`)
  @HttpCode(200)
  async login(@Body() inputLoginModel: LoginInputModel) {
    const result: AppResultType<
      Omit<AuthorizationUserResponseType, 'refreshToken'>
    > = await this.authService.login(inputLoginModel);
    switch (result.appResult) {
      case AppResult.Success:
        return result.data;
      case AppResult.Unauthorized:
        throw new UnauthorizedException();
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField.errorsMessages);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(`/${apiPrefixSettings.AUTH.registration}`)
  @HttpCode(200)
  async registration(@Body() inputRegistrationModel: RegistrationInputModel) {
    const result: AppResultType<string> = await this.authService.registration(
      inputRegistrationModel,
    );
    switch (result.appResult) {
      case AppResult.Success:
        return this.userQueryRepositories.getUserById(result.data);
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField.errorsMessages);
      default:
        throw new InternalServerErrorException();
    }
  }
}
