import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ChangePasswordInputModel,
  ConfirmUserByEmailInputModel,
  LoginInputModel,
  PasswordRecoveryInputModel,
  RegistrationInputModel,
  ResendConfirmationCodeInputModel,
} from './models/input/auth-input.models';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../application/command/login.command';
import { RegistrationCommand } from '../application/command/registration.command';
import { ConfirmUserEmailCommand } from '../application/command/confirm-user-email.command';
import { ResendConfirmationCodeCommand } from '../application/command/resend-confirmation-code.command';
import { ChangeUserPasswordCommand } from '../application/command/change-user-password.command';
import { PasswordRecoveryCommand } from '../application/command/password-recovery.command';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LogoutCommand } from '../application/command/logout.command';
import { UpdatePairTokenCommand } from '../application/command/update-new-pair-token.command';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import { UserQueryRepositories } from '../../../users/user/infrastructure/user-query-repositories';
import { AuthJWTAccessGuard } from '../../../../core/guards/jwt/jwt.guard';
import { CurrentUser } from '../../../../core/decorators/current-user';
import {
  APIErrorMessageType,
  ApiErrorsMessageModel,
  APIErrorsMessageType,
  AppResultType,
  AuthorizationUserResponseModel,
  AuthorizationUserResponseType,
  ClientInfoType,
  JWTAccessTokenPayloadType,
  JWTRefreshTokenPayloadType,
} from '../../../../base/types/types';
import { UserMeOutputModel } from '../../../users/user/api/models/output/user-output.model';
import { ClientInfo } from '../../../../core/decorators/client-info';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { RefreshJWTAccessGuard } from '../../../../core/guards/jwt/jwt-refresh-toke.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller(apiPrefixSettings.AUTH.auth)
export class AuthController {
  constructor(
    private readonly userQueryRepositories: UserQueryRepositories,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOkResponse({
    description: 'Return current user info',
    type: UserMeOutputModel,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Get info about current user by access token',
  })
  @Get(apiPrefixSettings.AUTH.me)
  @UseGuards(AuthJWTAccessGuard)
  async getCurrentUser(
    @CurrentUser() user: JWTAccessTokenPayloadType,
  ): Promise<UserMeOutputModel> {
    return await this.userQueryRepositories.getUserByIdAuthMe(user.userId);
  }

  @ApiOkResponse({
    description:
      'Return JWT accessToken in body and JWT refreshToken in cookie (http-only, secure).',
    type: AuthorizationUserResponseModel,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiOperation({
    summary: 'Login',
  })
  @Post(`/${apiPrefixSettings.AUTH.login}`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async login(
    @Body() inputLoginModel: LoginInputModel,
    @Res({ passthrough: true }) response: Response,
    @ClientInfo() clientInfo: ClientInfoType,
  ) {
    const result: AppResultType<
      AuthorizationUserResponseType,
      APIErrorMessageType
    > = await this.commandBus.execute(
      new LoginCommand(inputLoginModel, clientInfo),
    );

    switch (result.appResult) {
      case AppResult.Success:
        const { refreshToken, ...data } = result.data;
        response.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        return data;
      case AppResult.Unauthorized:
        throw new UnauthorizedException();
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiOperation({
    summary: 'Registration only with uniq login and email',
  })
  @Post(`/${apiPrefixSettings.AUTH.registration}`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registration(
    @Body() inputRegistrationModel: RegistrationInputModel,
  ): Promise<void> {
    const result: AppResultType<string, APIErrorsMessageType> =
      await this.commandBus.execute(
        new RegistrationCommand(inputRegistrationModel),
      );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField.errorsMessages);
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiResponse({ status: 204, description: 'Confirm user registration' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiOperation({
    summary: 'Confirm user registration',
  })
  @Post(`/${apiPrefixSettings.AUTH.registration_confirmation}`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registrationConfirmation(
    @Body() inputConfirmRegistrationModel: ConfirmUserByEmailInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.commandBus.execute(
        new ConfirmUserEmailCommand(inputConfirmRegistrationModel),
      );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiOperation({
    summary: 'Get new code for confirmation registration user',
  })
  @Post(`/${apiPrefixSettings.AUTH.registration_email_resending}`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async resendConfirmationCode(
    @Body() inputResendConfirmCodeModel: ResendConfirmationCodeInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.commandBus.execute(
        new ResendConfirmationCodeCommand(inputResendConfirmCodeModel),
      );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiResponse({
    status: 204,
    description:
      'Email was send, if email not correct success too, but will not send email',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiOperation({
    summary: 'Get email for change user password',
  })
  @Post(`/${apiPrefixSettings.AUTH.password_recovery}`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async recoveryPassword(
    @Body() inputPasswordRecoveryModel: PasswordRecoveryInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.commandBus.execute(
        new PasswordRecoveryCommand(inputPasswordRecoveryModel),
      );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiResponse({ status: 204, description: 'Success' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ApiErrorsMessageModel,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiOperation({
    summary: 'Change user password',
  })
  @Post(`/${apiPrefixSettings.AUTH.new_password}`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async changePassword(
    @Body() inputChangePasswordModel: ChangePasswordInputModel,
  ): Promise<void> {
    const result: AppResultType<null, APIErrorMessageType> =
      await this.commandBus.execute(
        new ChangeUserPasswordCommand(inputChangePasswordModel),
      );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.BadRequest:
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Logout',
    description:
      'Logout the user. The refresh token is stored in cookies: "refreshToken" and is used for logout. Clear cookies after logout.',
  })
  @Post(apiPrefixSettings.AUTH.logout)
  @UseGuards(RefreshJWTAccessGuard)
  @HttpCode(204)
  async logout(
    @CurrentUser()
    user: JWTRefreshTokenPayloadType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const result: AppResultType = await this.commandBus.execute(
      new LogoutCommand(user),
    );
    switch (result.appResult) {
      case AppResult.Success:
        response.clearCookie('refreshToken');
        return;
      case AppResult.Unauthorized:
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Return JWT accessToken in body and JWT refreshToken in cookie (http-only, secure).',
    type: AuthorizationUserResponseModel,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Generate new tokens pair',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for get new tokens pair.',
  })
  @Post(apiPrefixSettings.AUTH.refresh_token)
  @UseGuards(RefreshJWTAccessGuard)
  @HttpCode(200)
  async updatePairTokens(
    @CurrentUser()
    user: JWTRefreshTokenPayloadType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result: AppResultType<AuthorizationUserResponseType> =
      await this.commandBus.execute(new UpdatePairTokenCommand(user));
    switch (result.appResult) {
      case AppResult.Success:
        const { refreshToken, ...data } = result.data;
        response.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        return data;
      case AppResult.Unauthorized:
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
