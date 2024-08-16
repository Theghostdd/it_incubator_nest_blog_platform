import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppSettings, appSettings } from './settings/app-setting';
import { UserController } from './features/user/api/user-controller';
import { UserRepositories } from './features/user/infrastructure/user-repositories';
import { UserQueryRepositories } from './features/user/infrastructure/user-query-repositories';
import { UserService } from './features/user/application/user-service';
import { User, UserSchema } from './features/user/domain/user.entity';
import { UserMapperOutputModel } from './features/user/api/models/output/user-output.model';
import { AuthService } from './features/auth/application/auth-application';
import { UserSortingQuery } from './features/user/api/models/input/user-input.model';
import { TestingRepositories } from './features/testing/infrastructure/testing-repositories';
import { TestingService } from './features/testing/application/testing-application';
import { TestingController } from './features/testing/api/testing-controller';
import { BlogRepository } from './features/blog/infrastructure/blog-repositories';
import { BlogQueryRepository } from './features/blog/infrastructure/blog-query-repositories';
import { BlogService } from './features/blog/application/blog-service';
import { BlogController } from './features/blog/api/blog-controller';
import { BlogMapperOutputModel } from './features/blog/api/models/output/blog-output.model';
import { Blog, BlogSchema } from './features/blog/domain/blog.entity';
import { BlogSortingQuery } from './features/blog/api/models/input/blog-input.model';

const testingProviders = [TestingRepositories, TestingService];
const userProviders = [
  UserRepositories,
  UserQueryRepositories,
  UserService,
  UserMapperOutputModel,
  UserSortingQuery,
];
const blogProviders = [
  BlogRepository,
  BlogQueryRepository,
  BlogService,
  BlogMapperOutputModel,
  BlogSortingQuery,
];
const authProviders = [AuthService];
const appSettingsProviders = {
  provide: AppSettings,
  useValue: appSettings,
};
@Module({
  imports: [
    MongooseModule.forRoot(appSettings.api.MONGO_CONNECTION_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [UserController, TestingController, BlogController],
  providers: [
    ...userProviders,
    ...authProviders,
    appSettingsProviders,
    ...testingProviders,
    ...blogProviders,
  ],
})
export class AppModule {}
