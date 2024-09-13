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
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { CreateAuthSessionCommand } from './create-auth-session.command';
import { BcryptService } from '../../../../bcrypt/application/bcrypt-application';
import { UserType } from '../../../../users/user/domain/user.entity';

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
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<
    AppResultType<AuthorizationUserResponseType, APIErrorMessageType>
  > {
    const { loginOrEmail, password } = command.inputLoginModel;
    const { ip, userAgent } = command.clientInfo;
    if (!ip) return this.applicationObjectResult.unauthorized();

    const user: AppResultType<UserType | null> =
      await this.userService.getUseByLoginOrEmail(loginOrEmail);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.unauthorized();

    if (
      !(await this.bcryptService.comparePasswordHashAndSalt(
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

    const dId: string = this.authService.generateDeviceId(user.data.id);

    const payloadAccessToken: JWTAccessTokenPayloadType = {
      userId: user.data.id,
    };

    const payloadRefreshToken: JWTRefreshTokenPayloadType = {
      userId: user.data.id,
      deviceId: dId,
    };

    const accessToken: string =
      await this.authService.generateAccessToken(payloadAccessToken);

    const refreshToken: string =
      await this.authService.generateRefreshToken(payloadRefreshToken);

    const session: AppResultType = await this.commandBus.execute(
      new CreateAuthSessionCommand(dId, refreshToken, ip, userAgent),
    );

    if (session.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(null);

    return this.applicationObjectResult.success({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }
}
