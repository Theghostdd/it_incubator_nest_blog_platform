import { RegistrationInputModel } from '../../api/models/input/auth-input.models';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { addDays } from 'date-fns';
import { AuthService } from '../auth-application';
import { ConfigService } from '@nestjs/config';
import {
  APIErrorsMessageType,
  AppResultType,
} from '../../../../../base/types/types';
import { StaticOptions } from '../../../../../settings/app-static-settings';
import { UserService } from '../../../../users/user/application/user-service';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';
import { BcryptService } from '../../../../bcrypt/application/bcrypt-application';
import { User } from '../../../../users/user/domain/user.entity';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { Inject } from '@nestjs/common';
import { UserRegistrationEvent } from '../../../../users/user/application/event/user-registration.event';
import { CreatePlayerCommand } from '../../../../quiz-game/player/application/command/create-player.command';

export class RegistrationCommand {
  constructor(public registrationInputModel: RegistrationInputModel) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements
    ICommandHandler<
      RegistrationCommand,
      AppResultType<null, APIErrorsMessageType>
    >
{
  private readonly staticOptions: StaticOptions;
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly userRepositories: UserRepositories,
    private readonly bcryptService: BcryptService,
    @Inject(User.name) private readonly userEntity: typeof User,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {
    this.staticOptions = this.configService.get('staticSettings', {
      infer: true,
    });
  }
  async execute(
    command: RegistrationCommand,
  ): Promise<AppResultType<null, APIErrorsMessageType>> {
    const user: AppResultType<User, APIErrorsMessageType> =
      await this.userService.checkUniqLoginAndEmail(
        command.registrationInputModel.email,
        command.registrationInputModel.login,
      );

    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(user.errorField);

    const hash: string = await this.bcryptService.generatePasswordHashAndSalt(
      command.registrationInputModel.password,
    );

    const confirmationCode: string = this.authService.generateUuidCode(
      this.staticOptions.uuidOptions.confirmationEmail.prefix,
      this.staticOptions.uuidOptions.confirmationEmail.key,
    );
    const date: Date = new Date();
    const dateExpired: Date = addDays(date, 1);

    const newUser: User = this.userEntity.registrationUser(
      command.registrationInputModel,
      hash,
      confirmationCode,
      date,
      dateExpired,
    );

    newUser.id = await this.userRepositories.save(newUser);
    await this.commandBus.execute(new CreatePlayerCommand(newUser));
    this.eventBus.publish(
      new UserRegistrationEvent(newUser.email, confirmationCode),
    );
    return { appResult: AppResult.Success, data: null };
  }
}
