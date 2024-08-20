import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { UserTestManager } from '../utils/request-test-manager/user-test-manager';
import { UserTestModel } from '../models/user/user.model';
import { DataBase } from '../utils/clear-database/clear-data-base';

export interface ITestSettings {
  app: INestApplication;
  testingAppModule: TestingModule;
  testManager: ITestManger;
  dataBase: DataBase;
  testModels: ITestModels;
}

export interface ITestModels {
  userTestModel: UserTestModel;
}

export interface ITestManger {
  userTestManager: UserTestManager;
}
