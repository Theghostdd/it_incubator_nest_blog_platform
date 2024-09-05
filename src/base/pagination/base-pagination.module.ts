import { Global, Module } from '@nestjs/common';
import { BasePagination } from './base-pagination';

@Global()
@Module({
  providers: [BasePagination],
  exports: [BasePagination],
})
export class BasePaginationModule {}
