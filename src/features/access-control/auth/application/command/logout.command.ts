import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AppResultType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AuthSessionRepositories } from '../../infrastructure/auth-session-repositories';
import { AuthSessionDocumentType } from '../../domain/auth-session.entity';
import { AuthService } from '../auth-application';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class LogoutCommand {
  constructor(
    public user: JWTRefreshTokenPayloadType & { iat: number; exp: number },
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler
  implements ICommandHandler<LogoutCommand, AppResultType>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly authSessionRepositories: AuthSessionRepositories,
    private readonly authService: AuthService,
  ) {}
  async execute(command: LogoutCommand): Promise<AppResultType> {
    const { userId, deviceId, iat } = command.user;
    const session: AppResultType<AuthSessionDocumentType | null> =
      await this.authService.authSessionIsExistByDeviceId(deviceId);

    if (session.appResult !== AppResult.Success)
      return this.applicationObjectResult.unauthorized();
    if (session.data.issueAt != new Date(iat * 1000).toISOString())
      return this.applicationObjectResult.unauthorized();
    if (session.data.userId !== userId)
      return this.applicationObjectResult.unauthorized();

    await this.authSessionRepositories.delete(session.data);
    return this.applicationObjectResult.success(null);
  }
}