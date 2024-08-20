import request from 'supertest';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import { INestApplication } from '@nestjs/common';
import { IUserCreateTestModel } from '../../models/user/interfaces';

export class UserTestManager {
  constructor(private readonly app: INestApplication) {
    this.app = app;
  }
  createUser(userModel: IUserCreateTestModel, statusCode: number) {
    return request(this.app.getHttpServer())
      .post(`/${apiPrefixSettings.USER_PREFIX.user}`)
      .send(userModel)
      .expect(statusCode);
  }
}
