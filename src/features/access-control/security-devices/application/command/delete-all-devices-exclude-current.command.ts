import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSessionRepositories } from '../../../auth/infrastructure/auth-session-repositories';
import { AuthSession } from '../../../auth/domain/auth-session.entity';
import {
  AppResultType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';

export class DeleteAllDevicesExcludeCurrentCommand {
  constructor(public user: JWTRefreshTokenPayloadType) {}
}

@CommandHandler(DeleteAllDevicesExcludeCurrentCommand)
export class DeleteAllDevicesExcludeCurrentHandler
  implements
    ICommandHandler<DeleteAllDevicesExcludeCurrentCommand, AppResultType>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly authSessionRepositories: AuthSessionRepositories,
  ) {}
  async execute(
    command: DeleteAllDevicesExcludeCurrentCommand,
  ): Promise<AppResultType> {
    const { deviceId, userId } = command.user;

    const sessions: AuthSession[] | null =
      await this.authSessionRepositories.getSessionsByUserId(userId);
    if (!sessions) return this.applicationObjectResult.notFound();

    const ids: string[] = sessions
      .filter((session: AuthSession) => session.deviceId != deviceId)
      .map((session: AuthSession) => session.deviceId);
    if (ids.length > 0)
      await this.authSessionRepositories.deleteManySessions(ids);

    return this.applicationObjectResult.success(null);
  }
}
