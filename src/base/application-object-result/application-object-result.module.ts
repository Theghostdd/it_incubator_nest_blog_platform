import { ApplicationObjectResult } from './application-object-result';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [ApplicationObjectResult],
  exports: [ApplicationObjectResult],
})
export class ApplicationObjectResultModule {}
