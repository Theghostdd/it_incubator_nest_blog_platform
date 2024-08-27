import { RegistrationInputModel } from '../../api/models/input/auth-input.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  APIErrorsMessageType,
  AppResultType,
  MailTemplateType,
} from '../../../../base/types/types';
import {
  User,
  UserDocumentType,
  UserModelType,
} from '../../../user/domain/user.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { addDays } from 'date-fns';
import { UserService } from '../../../user/application/user-service';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AuthService } from '../auth-application';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { StaticOptions } from '../../../../settings/app-static-settings';
import { InjectModel } from '@nestjs/mongoose';
import { UserRepositories } from '../../../user/infrastructure/user-repositories';
import { MailTemplateService } from '../../../mail-template/application/template-application';
import { NodeMailerService } from '../../../nodemailer/application/nodemailer-application';

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
    private readonly mailTemplateService: MailTemplateService,
    private readonly nodeMailerService: NodeMailerService,
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {
    this.staticOptions = this.configService.get('staticSettings', {
      infer: true,
    });
  }
  async execute(
    command: RegistrationCommand,
  ): Promise<AppResultType<null, APIErrorsMessageType>> {
    const user: AppResultType<UserDocumentType, APIErrorsMessageType> =
      await this.userService.checkUniqLoginAndEmail(
        command.registrationInputModel.email,
        command.registrationInputModel.login,
      );

    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(user.errorField);

    const hash: string = await this.authService.generatePasswordHashAndSalt(
      command.registrationInputModel.password,
    );

    const confirmationCode: string = this.authService.generateUuidCode(
      this.staticOptions.uuidOptions.confirmationEmail.prefix,
      this.staticOptions.uuidOptions.confirmationEmail.key,
    );
    const dateExpired: string = addDays(new Date(), 1).toISOString();

    const newUser: UserDocumentType = this.userModel.registrationUserInstance(
      command.registrationInputModel,
      hash,
      confirmationCode,
      dateExpired,
    );

    await this.userRepositories.save(newUser);

    const template: MailTemplateType =
      await this.mailTemplateService.getConfirmationTemplate(confirmationCode);
    this.nodeMailerService.sendMail([newUser.email], template);
    return { appResult: AppResult.Success, data: null };
  }
}
