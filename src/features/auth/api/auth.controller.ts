import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { apiPrefixSettings } from '../../../settings/app-prefix-settings';
import { AuthService } from '../application/auth-application';
import {
  ChangePasswordInputModel,
  ConfirmUserByEmailInputModel,
  LoginInputModel,
  PasswordRecoveryInputModel,
  RegistrationInputModel,
  ResendConfirmationCodeInputModel,
} from './models/input/auth-input.models';
import {
  APIErrorMessageType,
  APIErrorsMessageType,
  AppResultType,
  AuthorizationUserResponseType,
  JWTAccessTokenPayloadType,
} from '../../../base/types/types';
import { AppResult } from '../../../base/enum/app-result.enum';
import { UserQueryRepositories } from '../../user/infrastructure/user-query-repositories';
import { UserMeOutputModel } from '../../user/api/models/output/user-output.model';
import { AuthJWTAccessGuard } from '../../../core/guards/jwt/jwt.guard';
import { CurrentUser } from '../../../core/decorators/current-user';
import { LimitRequestGuard } from '../../../core/guards/request-limiter/request-limiter.guard';

@Controller(apiPrefixSettings.AUTH.auth)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userQueryRepositories: UserQueryRepositories,
  ) {}

  @Get(apiPrefixSettings.AUTH.me)
  @UseGuards(AuthJWTAccessGuard)
  async getCurrentUser(
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<UserMeOutputModel> {
    return await this.userQueryRepositories.getUserByIdAuthMe(user.userId);
  }
  @Post(`/${apiPrefixSettings.AUTH.login}`)
  @HttpCode(200)
  async login(@Body() inputLoginModel: LoginInputModel) {
    const result: AppResultType<
      Omit<AuthorizationUserResponseType, 'refreshToken'>,
      APIErrorMessageType
    > = await this.authService.login(inputLoginModel);
    switch (result.appResult) {
      case AppResult.Success:
        return result.data;
      case AppResult.Unauthorized:
        throw new UnauthorizedException();
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(`/${apiPrefixSettings.AUTH.registration}`)
  @UseGuards(LimitRequestGuard)
  @HttpCode(204)
  async registration(
    @Body() inputRegistrationModel: RegistrationInputModel,
  ): Promise<void> {
    const result: AppResultType<string, APIErrorsMessageType> =
      await this.authService.registration(inputRegistrationModel);
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField.errorsMessages);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(`/${apiPrefixSettings.AUTH.registration_confirmation}`)
  @UseGuards(LimitRequestGuard)
  @HttpCode(204)
  async registrationConfirmation(
    @Body() inputConfirmRegistrationModel: ConfirmUserByEmailInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.authService.confirmUserByEmail(inputConfirmRegistrationModel);
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(`/${apiPrefixSettings.AUTH.registration_email_resending}`)
  @UseGuards(LimitRequestGuard)
  @HttpCode(204)
  async resendConfirmationCode(
    @Body() inputResendConfirmCodeModel: ResendConfirmationCodeInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.authService.resendConfirmCode(inputResendConfirmCodeModel);
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }
  @Post(`/${apiPrefixSettings.AUTH.password_recovery}`)
  @UseGuards(LimitRequestGuard)
  @HttpCode(204)
  async recoveryPassword(
    @Body() inputPasswordRecoveryModel: PasswordRecoveryInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.authService.passwordRecovery(inputPasswordRecoveryModel);
    switch (result.appResult) {
      case AppResult.Success:
        return;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(`/${apiPrefixSettings.AUTH.new_password}`)
  @UseGuards(LimitRequestGuard)
  @HttpCode(204)
  async changePassword(
    @Body() inputChangePasswordModel: ChangePasswordInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.authService.changeUserPassword(inputChangePasswordModel);
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }
}
