import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserTestManager } from './utils/request-test-manager/user-test-manager';
import { UserTestModel } from './models/user/user.model';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userTestManager: any;
  let userCreateModel: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    userTestManager = new UserTestManager(app);
    userCreateModel = new UserTestModel();
  });

  it('/ (GET)', async () => {
    const createUser = await userTestManager.createUser(
      userCreateModel.getUserCreateModel(),
      201,
    );
  });
});
