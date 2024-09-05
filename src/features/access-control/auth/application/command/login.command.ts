import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginInputModel } from '../../api/models/input/auth-input.models';
import { AuthService } from '../auth-application';
import {
  APIErrorMessageType,
  AppResultType,
  AuthorizationUserResponseType,
  ClientInfoType,
  JWTAccessTokenPayloadType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { UserService } from '../../../../users/user/application/user-service';
import { UserDocumentType } from '../../../../users/user/domain/user.entity';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { CreateAuthSessionCommand } from './create-auth-session.command';

export class LoginCommand {
  constructor(
    public inputLoginModel: LoginInputModel,
    public clientInfo: ClientInfoType,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler
  implements
    ICommandHandler<
      LoginCommand,
      AppResultType<
        Omit<AuthorizationUserResponseType, 'refreshToken'>,
        APIErrorMessageType
      >
    >
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<
    AppResultType<AuthorizationUserResponseType, APIErrorMessageType>
  > {
    const { loginOrEmail, password } = command.inputLoginModel;
    const { ip, userAgent } = command.clientInfo;
    const user: AppResultType<UserDocumentType | null> =
      await this.userService.userIsExistByLoginOrEmail(loginOrEmail);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.unauthorized();

    if (
      !(await this.authService.comparePasswordHashAndSalt(
        password,
        user.data.password,
      ))
    )
      return this.applicationObjectResult.unauthorized();
    if (!user.data.userConfirm.isConfirm)
      return this.applicationObjectResult.badRequest({
        message: 'Email has been confirmed',
        field: 'code',
      });

    const payloadAccessToken: JWTAccessTokenPayloadType = {
      userId: user.data._id.toString(),
    };

    const payloadRefreshToken: JWTRefreshTokenPayloadType = {
      userId: user.data._id.toString(),
    };

    const accessToken: string =
      await this.authService.generateAccessToken(payloadAccessToken);

    const refreshToken: string =
      await this.authService.generateRefreshToken(payloadRefreshToken);

    const session: AppResultType = await this.commandBus.execute(
      new CreateAuthSessionCommand(refreshToken, ip, userAgent),
    );

    if (session.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(null);

    return this.applicationObjectResult.success({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }
}
