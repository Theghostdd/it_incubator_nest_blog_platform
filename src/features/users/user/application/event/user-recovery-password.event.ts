import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NodeMailerService } from '../../../../nodemailer/application/nodemailer-application';
import { MailTemplateService } from '../../../../mail-template/application/template-application';
import { MailTemplateType } from '../../../../../base/types/types';

export class UserRecoveryPasswordEvent {
  constructor(
    public email: string,
    public confirmationCode: string,
  ) {}
}

@EventsHandler(UserRecoveryPasswordEvent)
export class UserRecoveryPasswordEventHandler
  implements IEventHandler<UserRecoveryPasswordEvent>
{
  constructor(
    private readonly nodeMailerService: NodeMailerService,
    private readonly mailTemplateService: MailTemplateService,
  ) {}

  async handle(event: UserRecoveryPasswordEvent) {
    const { email, confirmationCode } = event;
    const template: MailTemplateType =
      await this.mailTemplateService.getRecoveryPasswordTemplate(
        confirmationCode,
      );
    this.nodeMailerService.sendMail([email], template);
  }
}
