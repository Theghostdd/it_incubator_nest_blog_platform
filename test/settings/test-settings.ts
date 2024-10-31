import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import { UserTestManager } from '../utils/request-test-manager/user-test-manager';
import { INestApplication } from '@nestjs/common';
import { UserTestModel } from '../models/user/user.model';
import { ITestManger, ITestModels, ITestSettings } from './interfaces';
import { DataBase } from '../utils/database/database';
import { NodeMailerService } from '../../src/features/nodemailer/application/nodemailer-application';
import { NodeMailerMockService } from '../mock/nodemailer-mock';
import { AuthTestModel } from '../models/auth/auth.model';
import { BlogTestModel } from '../models/blog/blog.model';
import { PostTestModel } from '../models/post/post.model';
import { BlogTestManager } from '../utils/request-test-manager/blog-test-manager';
import { PostTestManager } from '../utils/request-test-manager/post-test-manager';
import { CommentsTestModel } from '../models/comments/comments.model';
import { CommentTestManager } from '../utils/request-test-manager/comment-test-manager';
import { AuthTestManager } from '../utils/request-test-manager/auth-test-manager';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../src/settings/configuration/configuration';
import { LikeTestModel } from '../models/like/likes.model';
import { ThrottlerMock } from '../mock/throttler-mock';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SecurityDevicesTestManager } from '../utils/request-test-manager/security-devices-test-manager';
import { DataSource } from 'typeorm';
import { QuizGameTestManager } from '../utils/request-test-manager/quiz-test-manager';

export const initSettings = async (): Promise<ITestSettings> => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });
  setGlobalMock(testingModuleBuilder);
  const testingAppModule: TestingModule = await testingModuleBuilder.compile();
  const app: INestApplication = testingAppModule.createNestApplication();
  applyAppSettings(app);
  await app.init();

  const dataSource: DataSource = await app.get(DataSource);
  const dataBase: DataBase = new DataBase(dataSource);

  const testManager: ITestManger = getTestManagers(app);

  const testModels: ITestModels = getTestModel();

  const configService = app.get(ConfigService<ConfigurationType, true>);

  return {
    app,
    testingAppModule,
    testManager,
    dataBase,
    testModels,
    configService,
  };
};

const getTestModel = (): ITestModels => {
  const userTestModel: UserTestModel = new UserTestModel();
  const authTestModel: AuthTestModel = new AuthTestModel(
    userTestModel.getUserCreateModel().email,
    userTestModel.getUserChangePasswordModel().recoveryCode,
  );
  const blogTestModel: BlogTestModel = new BlogTestModel();
  const postTestModel: PostTestModel = new PostTestModel();
  const commentsTestModel: CommentsTestModel = new CommentsTestModel(
    userTestModel.getUserCreateModel().login,
  );
  const likeTestModel: LikeTestModel = new LikeTestModel();

  return {
    userTestModel: userTestModel,
    authTestModel: authTestModel,
    blogTestModel: blogTestModel,
    postTestModel: postTestModel,
    likeTestModel: likeTestModel,
    commentsTestModel: commentsTestModel,
  };
};

const getTestManagers = (app: INestApplication): ITestManger => {
  const userTestManager = new UserTestManager(app);
  const blogTestManager: BlogTestManager = new BlogTestManager(app);
  const postTestManager: PostTestManager = new PostTestManager(app);
  const commentTestManager: CommentTestManager = new CommentTestManager(app);
  const authTestManager: AuthTestManager = new AuthTestManager(app);
  const securityDevicesTestManager: SecurityDevicesTestManager =
    new SecurityDevicesTestManager(app);
  const quizGameTestManager: QuizGameTestManager = new QuizGameTestManager(app);

  return {
    userTestManager: userTestManager,
    blogTestManager: blogTestManager,
    postTestManager: postTestManager,
    commentTestManager: commentTestManager,
    authTestManager: authTestManager,
    securityDevicesTestManager: securityDevicesTestManager,
    quizGameTestManager: quizGameTestManager,
  };
};

const setGlobalMock = (testingModule: TestingModuleBuilder) => {
  testingModule
    .overrideProvider(NodeMailerService)
    .useClass(NodeMailerMockService)
    .overrideGuard(ThrottlerGuard)
    .useClass(ThrottlerMock);
};
