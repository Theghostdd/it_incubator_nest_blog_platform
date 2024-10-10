import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSessionRepositories } from '../../infrastructure/auth-session-repositories';
import { AuthService } from '../auth-application';
import { AuthSession } from '../../domain/auth-session.entity';
import {
  AppResultType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class LogoutCommand {
  constructor(public user: JWTRefreshTokenPayloadType) {}
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
    const { deviceId } = command.user;

    const session: AppResultType<AuthSession | null> =
      await this.authService.getAuthSessionByDeviceId(deviceId);
    if (session.appResult !== AppResult.Success)
      return this.applicationObjectResult.unauthorized();

    session.data.deleteAuthSession();
    await this.authSessionRepositories.save(session.data);
    return this.applicationObjectResult.success(null);
  }
}
