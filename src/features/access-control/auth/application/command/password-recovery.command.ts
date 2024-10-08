import { PasswordRecoveryInputModel } from '../../api/models/input/auth-input.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { addMinutes } from 'date-fns';
import { AuthService } from '../auth-application';
import { ConfigService } from '@nestjs/config';
import { RecoveryPasswordSessionRepositories } from '../../infrastructure/recovery-password-session-repositories';
import { RecoveryPasswordSession } from '../../domain/recovery-session.entity';
import {
  AppResultType,
  MailTemplateType,
} from '../../../../../base/types/types';
import { StaticOptions } from '../../../../../settings/app-static-settings';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { UserService } from '../../../../users/user/application/user-service';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';
import { MailTemplateService } from '../../../../mail-template/application/template-application';
import { NodeMailerService } from '../../../../nodemailer/application/nodemailer-application';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { User } from '../../../../users/user/domain/user.entity';
import { Inject } from '@nestjs/common';

export class PasswordRecoveryCommand {
  constructor(public inputPasswordRecoveryModel: PasswordRecoveryInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler
  implements ICommandHandler<PasswordRecoveryCommand, AppResultType>
{
  private staticOptions: StaticOptions;
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly recoveryPasswordSessionRepositories: RecoveryPasswordSessionRepositories,
    private readonly mailTemplateService: MailTemplateService,
    private readonly nodeMailerService: NodeMailerService,
    @Inject(RecoveryPasswordSession.name)
    private readonly recoveryPasswordSessionEntity: typeof RecoveryPasswordSession,
  ) {
    this.staticOptions = this.configService.get('staticSettings', {
      infer: true,
    });
  }
  async execute(command: PasswordRecoveryCommand): Promise<AppResultType> {
    const { email } = command.inputPasswordRecoveryModel;
    const user: AppResultType<User | null> =
      await this.userService.getUserByEmail(email);

    const confirmationCode: string = this.authService.generateUuidCode(
      this.staticOptions.uuidOptions.recoveryPasswordSessionCode.prefix,
      this.staticOptions.uuidOptions.recoveryPasswordSessionCode.key,
    );

    if (user.appResult === AppResult.Success) {
      const date: Date = new Date();
      const dateExpired: Date = addMinutes(date, 20);

      const recoverySession: RecoveryPasswordSession =
        this.recoveryPasswordSessionEntity.createRecoveryPasswordSession(
          command.inputPasswordRecoveryModel.email,
          confirmationCode,
          dateExpired,
          user.data,
        );
      await this.recoveryPasswordSessionRepositories.save(recoverySession);
    }

    const template: MailTemplateType =
      await this.mailTemplateService.getRecoveryPasswordTemplate(
        confirmationCode,
      );
    this.nodeMailerService.sendMail([email], template);

    return this.applicationObjectResult.success(null);
  }
}
