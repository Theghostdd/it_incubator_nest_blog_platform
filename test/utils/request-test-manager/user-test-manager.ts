import request from 'supertest';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';

export class UserTestManager {
  constructor(private readonly app: any) {
    this.app = app;
  }
  createUser(userModel: any, statusCode: number) {
    return request(this.app.getHttpServer())
      .post(`/${apiPrefixSettings.USER_PREFIX.user}`)
      .send(userModel)
      .expect(statusCode);
  }
}
