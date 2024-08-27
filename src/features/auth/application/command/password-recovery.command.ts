import { PasswordRecoveryInputModel } from '../../api/models/input/auth-input.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType, MailTemplateType } from '../../../../base/types/types';
import { UserDocumentType } from '../../../user/domain/user.entity';
import { addMinutes } from 'date-fns';
import {
  RecoveryPasswordSession,
  RecoveryPasswordSessionDocumentType,
  RecoveryPasswordSessionModelType,
} from '../../domain/recovery-session.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { UserService } from '../../../user/application/user-service';
import { AuthService } from '../auth-application';
import { StaticOptions } from '../../../../settings/app-static-settings';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { InjectModel } from '@nestjs/mongoose';
import { RecoveryPasswordSessionRepositories } from '../../infrastructure/recovery-password-session-repositories';
import { MailTemplateService } from '../../../mail-template/application/template-application';
import { NodeMailerService } from '../../../nodemailer/application/nodemailer-application';

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
    @InjectModel(RecoveryPasswordSession.name)
    private readonly recoveryPasswordSession: RecoveryPasswordSessionModelType,
    private readonly recoveryPasswordSessionRepositories: RecoveryPasswordSessionRepositories,
    private readonly mailTemplateService: MailTemplateService,
    private readonly nodeMailerService: NodeMailerService,
  ) {
    this.staticOptions = this.configService.get('staticSettings', {
      infer: true,
    });
  }
  async execute(command: PasswordRecoveryCommand): Promise<AppResultType> {
    const { email } = command.inputPasswordRecoveryModel;
    const user: AppResultType<UserDocumentType | null> =
      await this.userService.userIsExistByEmail(email);

    const confirmationCode: string = this.authService.generateUuidCode(
      this.staticOptions.uuidOptions.recoveryPasswordSessionCode.prefix,
      this.staticOptions.uuidOptions.recoveryPasswordSessionCode.key,
    );

    if (user.appResult === AppResult.Success) {
      const dateExpired: string = addMinutes(new Date(), 20).toISOString();

      const recoverySession: RecoveryPasswordSessionDocumentType =
        this.recoveryPasswordSession.createSessionInstance(
          command.inputPasswordRecoveryModel,
          confirmationCode,
          dateExpired,
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
