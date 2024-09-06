import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AppResultType,
  AuthorizationUserResponseType,
  JWTAccessTokenPayloadType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AuthService } from '../auth-application';
import { AuthSessionDocumentType } from '../../domain/auth-session.entity';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { AuthSessionRepositories } from '../../infrastructure/auth-session-repositories';

export class UpdatePairTokenCommand {
  constructor(public user: JWTRefreshTokenPayloadType) {}
}

@CommandHandler(UpdatePairTokenCommand)
export class UpdatePairTokenHandler
  implements
    ICommandHandler<
      UpdatePairTokenCommand,
      AppResultType<AuthorizationUserResponseType>
    >
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly authService: AuthService,
    private readonly authSessionRepositories: AuthSessionRepositories,
  ) {}
  async execute(
    command: UpdatePairTokenCommand,
  ): Promise<AppResultType<AuthorizationUserResponseType>> {
    const { userId, deviceId } = command.user;
    const session: AppResultType<AuthSessionDocumentType | null> =
      await this.authService.authSessionIsExistByDeviceId(deviceId);

    if (session.appResult !== AppResult.Success)
      return this.applicationObjectResult.unauthorized();

    const payloadAccessToken: JWTAccessTokenPayloadType = {
      userId: userId,
    };

    const payloadRefreshToken: JWTRefreshTokenPayloadType = {
      userId: userId,
      deviceId: deviceId,
    };

    const accessToken =
      await this.authService.generateAccessToken(payloadAccessToken);
    const refreshToken =
      await this.authService.generateAccessToken(payloadRefreshToken);

    const {
      iat: iatNewDate,
      exp: expNewDate,
    }: JWTRefreshTokenPayloadType & { iat: number; exp: number } =
      await this.authService.decodeJWTToken(refreshToken);

    const iatDate: string = new Date(iatNewDate * 1000).toISOString();
    const expDate: string = new Date(expNewDate * 1000).toISOString();

    session.data.updateAuthSession(iatDate, expDate);
    await this.authSessionRepositories.save(session.data);

    return this.applicationObjectResult.success({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }
}
