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
import { PostRepository } from './features/post/infrastructure/post-repositories';
import { PostQueryRepository } from './features/post/infrastructure/post-query-repositories';
import { PostService } from './features/post/application/post-service';
import { PostMapperOutputModel } from './features/post/api/models/output/post-output.model';
import { BaseSorting } from './base/sorting/base-sorting';
import { PostController } from './features/post/api/post-controller';
import { Post, PostSchema } from './features/post/domain/post.entity';
import { CommentController } from './features/comment/api/comment-controller';
import { CommentQueryRepositories } from './features/comment/infrastructure/comment-query-repositories';
import {
  Comment,
  CommentSchema,
} from './features/comment/domain/comment.entity';
import { CommentMapperOutputModel } from './features/comment/api/model/output/comment-output.model';

const testingProviders = [TestingRepositories, TestingService];
const userProviders = [
  UserRepositories,
  UserQueryRepositories,
  UserService,
  UserMapperOutputModel,
  UserSortingQuery,
];

const commentProviders = [CommentQueryRepositories, CommentMapperOutputModel];
const postProviders = [
  PostService,
  PostRepository,
  PostQueryRepository,
  PostMapperOutputModel,
  BaseSorting,
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
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    UserController,
    TestingController,
    BlogController,
    PostController,
    CommentController,
  ],
  providers: [
    ...userProviders,
    ...authProviders,
    ...postProviders,
    appSettingsProviders,
    ...testingProviders,
    ...blogProviders,
    ...commentProviders,
  ],
})
export class AppModule {}
