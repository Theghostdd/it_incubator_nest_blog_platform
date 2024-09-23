import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../../auth/application/auth-application';
import { AuthSessionRepositories } from '../../../auth/infrastructure/auth-session-repositories';
import { AuthSessionType } from '../../../auth/domain/auth-session.entity';
import {
  AppResultType,
  JWTRefreshTokenPayloadType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class DeleteDevicesByDeviceIdCommand {
  constructor(
    public user: JWTRefreshTokenPayloadType,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteDevicesByDeviceIdCommand)
export class DeleteDeviceByDeviceIdHandler
  implements ICommandHandler<DeleteDevicesByDeviceIdCommand, AppResultType>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly authService: AuthService,
    private readonly authSessionRepositories: AuthSessionRepositories,
  ) {}
  async execute(
    command: DeleteDevicesByDeviceIdCommand,
  ): Promise<AppResultType> {
    const { userId } = command.user;
    const { deviceId } = command;

    const session: AppResultType<AuthSessionType | null> =
      await this.authService.getAuthSessionByDeviceId(deviceId);
    if (session.appResult !== AppResult.Success)
      return this.applicationObjectResult.notFound();
    if (session.data.userId !== userId)
      return this.applicationObjectResult.forbidden();

    await this.authSessionRepositories.delete(session.data.id);
    return this.applicationObjectResult.success(null);
  }
}
