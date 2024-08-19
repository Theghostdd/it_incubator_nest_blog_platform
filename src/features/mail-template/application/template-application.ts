import { Injectable } from '@nestjs/common';
import { MailTemplateType } from '../../../base/types/types';

@Injectable()
export class MailTemplateService {
  constructor() {}
  async getConfirmationTemplate(code: string): Promise<MailTemplateType> {
    return {
      subject: 'Some Subject',
      html: `
                <h1>Thanks for your registration</h1>
                <p>To finish registration please follow the link below:
                    <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
                </p>
            `,
    };
  }

  async getRecoveryPasswordTemplate(code: string): Promise<MailTemplateType> {
    return {
      subject: 'Recovery password',
      html: `
                 <h1>Password recovery</h1>
                 <p>To finish password recovery please follow the link below:
                     <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
                 </p>
            `,
    };
  }
}
