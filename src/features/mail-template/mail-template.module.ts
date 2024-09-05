import { Module } from '@nestjs/common';
import { MailTemplateService } from './application/template-application';

@Module({
  imports: [],
  providers: [MailTemplateService],
  exports: [MailTemplateService],
})
export class MailTemplateModule {}
