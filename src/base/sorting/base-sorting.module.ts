import { Global, Module } from '@nestjs/common';
import { BaseSorting } from './base-sorting';

@Global()
@Module({
  providers: [BaseSorting],
  exports: [BaseSorting],
})
export class BaseSortingModule {}
