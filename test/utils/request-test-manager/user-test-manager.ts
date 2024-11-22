import request from 'supertest';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import { INestApplication } from '@nestjs/common';
import { IUserCreateTestModel } from '../../models/user/interfaces';
import { AnyObject } from 'mongoose';
import { UserBanInputModel } from '../../../src/features/users/user/api/models/input/user-input.model';

export class UserTestManager {
  private readonly apiPrefix: string;
  private readonly userEndpoint: string;
  private readonly userBanEndpoint: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.userEndpoint = `${this.apiPrefix}/${apiPrefixSettings.USER_PREFIX.user}`;
    this.userBanEndpoint = `${apiPrefixSettings.USER_PREFIX.ban}`;
  }
  async createUser(
    userModel: IUserCreateTestModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.userEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(userModel)
      .expect(statusCode);
    return result.body;
  }

  async getUsers(
    query: AnyObject,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.userEndpoint}`)
      .set({ authorization: authorizationToken })
      .query(query)
      .expect(statusCode);
    return result.body;
  }

  async deleteUser(id: string, authorizationToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.userEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async banUnBanUser(
    id: string,
    userBanInputModel: UserBanInputModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.userEndpoint}/${id}/${this.userBanEndpoint}`)
      .send(userBanInputModel)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }
}
