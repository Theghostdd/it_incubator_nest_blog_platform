import { ResendConfirmationCodeInputModel } from '../../api/models/input/auth-input.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { addDays } from 'date-fns';
import { AuthService } from '../auth-application';
import { ConfigService } from '@nestjs/config';
import {
  APIErrorMessageType,
  AppResultType,
  MailTemplateType,
} from '../../../../../base/types/types';
import { StaticOptions } from '../../../../../settings/app-static-settings';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { UserService } from '../../../../users/user/application/user-service';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';
import { MailTemplateService } from '../../../../mail-template/application/template-application';
import { NodeMailerService } from '../../../../nodemailer/application/nodemailer-application';
import { UserDocumentType } from '../../../../users/user/domain/user.entity';
import { AppResult } from '../../../../../base/enum/app-result.enum';

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
    private readonly mailTemplateService: MailTemplateService,
    private readonly nodeMailerService: NodeMailerService,
  ) {
    this.staticOptions = this.configService.get('staticSettings', {
      infer: true,
    });
  }
  async execute(
    command: ResendConfirmationCodeCommand,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const { email } = command.inputResendConfirmCodeModel;
    const user: AppResultType<UserDocumentType | null> =
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
    const dateExpired: string = addDays(new Date(), 1).toISOString();

    user.data.updateConfirmationCode(confirmationCode, dateExpired);
    await this.userRepositories.save(user.data);

    const template: MailTemplateType =
      await this.mailTemplateService.getConfirmationTemplate(confirmationCode);
    this.nodeMailerService.sendMail([user.data.email], template);

    return this.applicationObjectResult.success(null);
  }
}
