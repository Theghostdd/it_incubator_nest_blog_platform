import { Module } from '@nestjs/common';
import { NodeMailerService } from './application/nodemailer-application';

@Module({
  providers: [NodeMailerService],
  exports: [NodeMailerService],
})
export class NodeMailerModule {}
