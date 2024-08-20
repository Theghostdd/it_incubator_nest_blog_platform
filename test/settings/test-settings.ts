import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { UserTestManager } from '../utils/request-test-manager/user-test-manager';
import { INestApplication } from '@nestjs/common';
import { UserTestModel } from '../models/user/user.model';
import { ITestManger, ITestModels, ITestSettings } from './interfaces';
import { DataBase } from '../utils/clear-database/clear-data-base';
import { NodeMailerService } from '../../src/features/nodemailer/application/nodemailer-application';
import { NodeMailerMockService } from '../mock/nodemailer-mock';
import { AuthTestModel } from '../models/auth/auth.model';
import { BlogTestModel } from '../models/blog/blog.model';
import { PostTestModel } from '../models/post/post.model';

export const initSettings = async (): Promise<ITestSettings> => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  setGlobalMock(testingModuleBuilder);

  const testingAppModule: TestingModule = await testingModuleBuilder.compile();
  const app: INestApplication = testingAppModule.createNestApplication();
  applyAppSettings(app);
  await app.init();

  const databaseConnection: Connection =
    app.get<Connection>(getConnectionToken());
  const dataBase: DataBase = new DataBase(databaseConnection);

  const testManager: ITestManger = getTestManagers(app);

  const testModels: ITestModels = getTestModel();

  return {
    app,
    testingAppModule,
    testManager,
    dataBase,
    testModels,
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

  return {
    userTestModel: userTestModel,
    authTestModel: authTestModel,
    blogTestModel: blogTestModel,
    postTestModel: postTestModel,
  };
};

const getTestManagers = (app: INestApplication): ITestManger => {
  const userTestManager = new UserTestManager(app);

  return {
    userTestManager: userTestManager,
  };
};

const setGlobalMock = (testingModule: TestingModuleBuilder) => {
  const nodemailerMockService = new NodeMailerMockService();
  testingModule
    .overrideProvider(NodeMailerService)
    .useValue(nodemailerMockService);
};
