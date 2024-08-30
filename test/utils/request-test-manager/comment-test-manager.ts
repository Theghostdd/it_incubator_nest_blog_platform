import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import request from 'supertest';
import { ICommentUpdateModel } from '../../models/comments/interfaces';

export class CommentTestManager {
  private readonly apiPrefix: string;
  private readonly commentEndpoint: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.commentEndpoint = `${this.apiPrefix}/${apiPrefixSettings.COMMENT.comments}`;
  }

  async getComment(id: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.commentEndpoint}/${id}`)
      .expect(statusCode);
    return result.body;
  }

  async updateCommentById(
    id: string,
    updateModel: ICommentUpdateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.commentEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }

  async deleteCommentById(
    id: string,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.commentEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }
}
