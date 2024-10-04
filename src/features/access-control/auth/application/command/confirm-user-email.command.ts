import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmUserByEmailInputModel } from '../../api/models/input/auth-input.models';
import { compareAsc } from 'date-fns';
import {
  APIErrorMessageType,
  AppResultType,
} from '../../../../../base/types/types';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';
import { UserService } from '../../../../users/user/application/user-service';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { User } from '../../../../users/user/domain/user.entity';
import { Inject } from '@nestjs/common';

export class ConfirmUserEmailCommand {
  constructor(
    public inputConfirmUserByEmailModel: ConfirmUserByEmailInputModel,
  ) {}
}

@CommandHandler(ConfirmUserEmailCommand)
export class ConfirmUserEmailHandler
  implements
    ICommandHandler<
      ConfirmUserEmailCommand,
      AppResultType<null, APIErrorMessageType>
    >
{
  constructor(
    private readonly userRepositories: UserRepositories,
    private readonly userService: UserService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @Inject(User.name) private readonly userEntity: typeof User,
  ) {}
  async execute(
    command: ConfirmUserEmailCommand,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const { code } = command.inputConfirmUserByEmailModel;
    const user: AppResultType<User | null> =
      await this.userService.getUserByConfirmationCode(code);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest({
        message: 'Code not found',
        field: 'code',
      });

    if (user.data.userConfirm.isConfirm)
      return this.applicationObjectResult.badRequest({
        message: 'Email has been confirmed',
        field: 'code',
      });

    if (compareAsc(new Date(), user.data.userConfirm.dataExpire) === 1)
      return this.applicationObjectResult.badRequest({
        message: 'The confirmation code has expired',
        field: 'code',
      });

    user.data.confirmEmail();
    await this.userRepositories.save(user.data);

    return this.applicationObjectResult.success(null);
  }
}
