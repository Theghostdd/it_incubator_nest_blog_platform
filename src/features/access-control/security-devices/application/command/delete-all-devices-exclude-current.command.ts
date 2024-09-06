import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AppResultType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AuthSessionRepositories } from '../../../auth/infrastructure/auth-session-repositories';
import { AuthSessionDocumentType } from '../../../auth/domain/auth-session.entity';
import { Types } from 'mongoose';

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

    const sessions: AuthSessionDocumentType[] | null =
      await this.authSessionRepositories.getSessionsByUserId(userId);
    if (!sessions) return this.applicationObjectResult.notFound();

    const ids: Types.ObjectId[] = sessions
      .filter((session: AuthSessionDocumentType) => session.dId != deviceId)
      .map((session: AuthSessionDocumentType) => session._id);
    await this.authSessionRepositories.deleteSessions(ids);
    return this.applicationObjectResult.success(null);
  }
}
