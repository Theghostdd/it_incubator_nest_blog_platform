import { TestingService } from './application/testing-application';
import { Module } from '@nestjs/common';
import { TestingController } from './api/testing-controller';
import { TestingRepositories } from './infrastructure/testing-repositories';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService, TestingRepositories],
})
export class TestingModule {}
