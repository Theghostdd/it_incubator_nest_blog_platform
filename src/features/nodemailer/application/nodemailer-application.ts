import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailTemplateType } from '../../../base/types/types';

@Injectable()
export class NodeMailerService {
  constructor(private readonly mailerService: MailerService) {}

  sendMail(to: string[], template: MailTemplateType): void {
    this.mailerService
      .sendMail({
        to: to,
        subject: template.subject,
        html: template.html,
      })
      .catch((e: any) => console.error('e ', e));
  }
}
