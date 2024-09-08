import { Module } from '@nestjs/common';
import { BcryptService } from './application/bcrypt-application';

@Module({
  imports: [],
  providers: [BcryptService],
  exports: [BcryptService],
})
export class BcryptModule {}
