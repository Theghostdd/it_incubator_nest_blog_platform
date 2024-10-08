import { ChangePasswordInputModel } from '../../api/models/input/auth-input.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { compareAsc } from 'date-fns';
import { AuthService } from '../auth-application';
import { RecoveryPasswordSessionRepositories } from '../../infrastructure/recovery-password-session-repositories';
import { RecoveryPasswordSession } from '../../domain/recovery-session.entity';
import {
  APIErrorMessageType,
  AppResultType,
} from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { UserService } from '../../../../users/user/application/user-service';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';
import { BcryptService } from '../../../../bcrypt/application/bcrypt-application';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { User } from '../../../../users/user/domain/user.entity';

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
    private readonly bcryptService: BcryptService,
  ) {}
  async execute(
    command: ChangeUserPasswordCommand,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const { recoveryCode, newPassword } = command.inputChangePasswordModel;
    const recoverySession: AppResultType<RecoveryPasswordSession | null> =
      await this.authService.getRecoveryPasswordSessionByCode(recoveryCode);
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

    const user: AppResultType<User | null> =
      await this.userService.getUserByEmail(email);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(null);
    if (user.data.id !== recoverySession.data.userId)
      return this.applicationObjectResult.badRequest(null);

    const hash =
      await this.bcryptService.generatePasswordHashAndSalt(newPassword);

    user.data.changePassword(hash);
    recoverySession.data.deleteRecoveryPasswordSession();
    await Promise.all([
      this.userRepositories.save(user.data),
      this.recoveryPasswordSessionRepositories.save(recoverySession.data),
    ]);
    return this.applicationObjectResult.success(null);
  }
}
