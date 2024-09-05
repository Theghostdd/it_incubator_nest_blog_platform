import { TestingService } from './application/testing-application';
import { Module } from '@nestjs/common';
import { AccessControlModule } from '../access-control/access-control.module';
import { TestingController } from './api/testing-controller';
import { TestingRepositories } from './infrastructure/testing-repositories';
import { UsersModule } from '../users/users.module';
import { BlogPlatformModule } from '../blog-platform/blog-platform.module';

@Module({
  imports: [AccessControlModule, UsersModule, BlogPlatformModule],
  controllers: [TestingController],
  providers: [TestingService, TestingRepositories],
})
export class TestingModule {}
