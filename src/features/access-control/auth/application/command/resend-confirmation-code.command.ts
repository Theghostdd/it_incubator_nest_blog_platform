import { ResendConfirmationCodeInputModel } from '../../api/models/input/auth-input.models';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { addDays } from 'date-fns';
import { AuthService } from '../auth-application';
import { ConfigService } from '@nestjs/config';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import {
  APIErrorMessageType,
  AppResultType,
} from '../../../../../base/types/types';
import { StaticOptions } from '../../../../../settings/app-static-settings';
import { UserService } from '../../../../users/user/application/user-service';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { User } from '../../../../users/user/domain/user.entity';
import { UserRegistrationEvent } from '../../../../users/user/application/event/user-registration.event';

export class ResendConfirmationCodeCommand {
  constructor(
    public inputResendConfirmCodeModel: ResendConfirmationCodeInputModel,
  ) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeHandler
  implements
    ICommandHandler<
      ResendConfirmationCodeCommand,
      AppResultType<null, APIErrorMessageType>
    >
{
  private staticOptions: StaticOptions;

  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly userRepositories: UserRepositories,
    private readonly eventBus: EventBus,
  ) {
    this.staticOptions = this.configService.get('staticSettings', {
      infer: true,
    });
  }
  async execute(
    command: ResendConfirmationCodeCommand,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const { email } = command.inputResendConfirmCodeModel;
    const user: AppResultType<User | null> =
      await this.userService.getUserByEmail(email);
    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest({
        message: 'Email is not found',
        field: 'email',
      });

    if (user.data.userConfirm.isConfirm)
      return this.applicationObjectResult.badRequest({
        message: 'Email has been confirmed',
        field: 'email',
      });

    const confirmationCode: string = this.authService.generateUuidCode(
      this.staticOptions.uuidOptions.newConfirmationCode.prefix,
      this.staticOptions.uuidOptions.newConfirmationCode.key,
    );
    const dateExpired: Date = addDays(new Date(), 1);

    user.data.updateConfirmationCode(confirmationCode, dateExpired);
    await this.userRepositories.save(user.data);

    this.eventBus.publish(
      new UserRegistrationEvent(user.data.email, confirmationCode),
    );
    return this.applicationObjectResult.success(null);
  }
}
