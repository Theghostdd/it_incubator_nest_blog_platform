import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import request from 'supertest';

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
}
