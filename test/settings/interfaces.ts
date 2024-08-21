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

export interface ITestSettings {
  app: INestApplication;
  testingAppModule: TestingModule;
  testManager: ITestManger;
  dataBase: DataBase;
  testModels: ITestModels;
}

export interface ITestModels {
  userTestModel: UserTestModel;
  authTestModel: AuthTestModel;
  blogTestModel: BlogTestModel;
  postTestModel: PostTestModel;
  commentsTestModel: CommentsTestModel;
}

export interface ITestManger {
  userTestManager: UserTestManager;
  blogTestManager: BlogTestManager;
  postTestManager: PostTestManager;
}
