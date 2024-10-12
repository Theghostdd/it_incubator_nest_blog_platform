import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NodeMailerService } from '../../../../nodemailer/application/nodemailer-application';
import { MailTemplateService } from '../../../../mail-template/application/template-application';
import { MailTemplateType } from '../../../../../base/types/types';

export class UserRegistrationEvent {
  constructor(
    public email: string,
    public confirmationCode: string,
  ) {}
}

@EventsHandler(UserRegistrationEvent)
export class UserRegistrationEventHandler
  implements IEventHandler<UserRegistrationEvent>
{
  constructor(
    private readonly nodeMailerService: NodeMailerService,
    private readonly mailTemplateService: MailTemplateService,
  ) {}

  async handle(event: UserRegistrationEvent) {
    const { email, confirmationCode } = event;
    const template: MailTemplateType =
      await this.mailTemplateService.getConfirmationTemplate(confirmationCode);
    this.nodeMailerService.sendMail([email], template);
  }
}
