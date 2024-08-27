import { ChangePasswordInputModel } from '../../api/models/input/auth-input.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  APIErrorMessageType,
  AppResultType,
} from '../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { RecoveryPasswordSessionDocumentType } from '../../domain/recovery-session.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { compareAsc } from 'date-fns';
import { UserDocumentType } from '../../../user/domain/user.entity';
import { AuthService } from '../auth-application';
import { UserService } from '../../../user/application/user-service';
import { UserRepositories } from '../../../user/infrastructure/user-repositories';
import { RecoveryPasswordSessionRepositories } from '../../infrastructure/recovery-password-session-repositories';

export class ChangeUserPasswordCommand {
  constructor(public inputChangePasswordModel: ChangePasswordInputModel) {}
}

@CommandHandler(ChangeUserPasswordCommand)
export class ChangeUserPasswordHandler
  implements
    ICommandHandler<
      ChangeUserPasswordCommand,
      AppResultType<null, APIErrorMessageType>
    >
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userRepositories: UserRepositories,
    private readonly recoveryPasswordSessionRepositories: RecoveryPasswordSessionRepositories,
  ) {}
  async execute(
    command: ChangeUserPasswordCommand,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const { recoveryCode, newPassword } = command.inputChangePasswordModel;
    const recoverySession: AppResultType<RecoveryPasswordSessionDocumentType | null> =
      await this.authService.recoveryPasswordSessionIsExistByCode(recoveryCode);
    if (recoverySession.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest({
        message: 'Bad code',
        field: 'recoveryCode',
      });

    const { expAt, email } = recoverySession.data;

    if (compareAsc(new Date(), expAt) === 1)
      return this.applicationObjectResult.badRequest({
        message: 'Code is expired',
        field: 'recoveryCode',
      });

    const user: AppResultType<UserDocumentType | null> =
      await this.userService.userIsExistByEmail(email);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(null);

    const hash =
      await this.authService.generatePasswordHashAndSalt(newPassword);

    user.data.changePassword(hash);
    await this.userRepositories.save(user.data);
    await this.recoveryPasswordSessionRepositories.delete(recoverySession.data);
    return this.applicationObjectResult.success(null);
  }
}
