import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import {
  AuthSession,
  AuthSessionFactory,
} from '../../domain/auth-session.entity';
import { AuthService } from '../auth-application';
import {
  AppResultType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { AuthSessionRepositories } from '../../infrastructure/auth-session-repositories';

export class CreateAuthSessionCommand {
  constructor(
    public deviceId: string,
    public refreshToken: string,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(CreateAuthSessionCommand)
export class CreateAuthSessionHandler
  implements ICommandHandler<CreateAuthSessionCommand, AppResultType>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly authService: AuthService,
    private readonly authSessionRepositories: AuthSessionRepositories,
    private readonly authSessionFactory: AuthSessionFactory,
  ) {}
  async execute(command: CreateAuthSessionCommand): Promise<AppResultType> {
    const { deviceId, refreshToken, ip, deviceName } = command;

    const refreshTokenPayload: JWTRefreshTokenPayloadType & {
      iat: number;
      exp: number;
    } = await this.authService.decodeJWTToken(refreshToken);

    if (!refreshTokenPayload)
      return this.applicationObjectResult.badRequest(null);

    const { userId, iat, exp } = refreshTokenPayload;
    const iatDate: Date = new Date(iat * 1000);
    const expDate: Date = new Date(exp * 1000);

    const authSession: AuthSession = this.authSessionFactory.create(
      deviceId,
      ip,
      deviceName,
      userId,
      iatDate,
      expDate,
    );
    await this.authSessionRepositories.save(authSession);
    return this.applicationObjectResult.success(null);
  }
}
