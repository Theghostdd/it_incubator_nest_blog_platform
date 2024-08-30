import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { UserTestManager } from '../utils/request-test-manager/user-test-manager';
import { UserTestModel } from '../models/user/user.model';
import { DataBase } from '../utils/clear-database/clear-data-base';
import { AuthTestModel } from '../models/auth/auth.model';
import { BlogTestModel } from '../models/blog/blog.model';
import { PostTestModel } from '../models/post/post.model';
import { BlogTestManager } from '../utils/request-test-manager/blog-test-manager';
import { PostTestManager } from '../utils/request-test-manager/post-test-manager';
import { CommentsTestModel } from '../models/comments/comments.model';
import { CommentTestManager } from '../utils/request-test-manager/comment-test-manager';
import { AuthTestManager } from '../utils/request-test-manager/auth-test-manager';
import { ConfigurationType } from '../../src/settings/configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { LikeTestModel } from '../models/like/likes.model';

export interface ITestSettings {
  app: INestApplication;
  testingAppModule: TestingModule;
  testManager: ITestManger;
  dataBase: DataBase;
  testModels: ITestModels;
  configService: ConfigService<ConfigurationType, true>;
}

export interface ITestModels {
  userTestModel: UserTestModel;
  authTestModel: AuthTestModel;
  blogTestModel: BlogTestModel;
  postTestModel: PostTestModel;
  commentsTestModel: CommentsTestModel;
  likeTestModel: LikeTestModel;
}

export interface ITestManger {
  userTestManager: UserTestManager;
  blogTestManager: BlogTestManager;
  postTestManager: PostTestManager;
  commentTestManager: CommentTestManager;
  authTestManager: AuthTestManager;
}
