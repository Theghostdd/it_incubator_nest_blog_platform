import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import request from 'supertest';
import { ICommentUpdateModel } from '../../models/comments/interfaces';
import { ILikeUpdateModel } from '../../models/like/interfaces';

export class CommentTestManager {
  private readonly apiPrefix: string;
  private readonly commentEndpoint: string;
  private readonly likeEndpoint: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.commentEndpoint = `${this.apiPrefix}/${apiPrefixSettings.COMMENT.comments}`;
    this.likeEndpoint = `${apiPrefixSettings.COMMENT.like_status}`;
  }

  async getComment(
    id: string,
    statusCode: number,
    authorizationToken?: string,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.commentEndpoint}/${id}`)
      .set({ authorization: authorizationToken || null })
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

  async updateCommentLikeStatusByPostId(
    id: string,
    likeModel: ILikeUpdateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.commentEndpoint}/${id}/${this.likeEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(likeModel)
      .expect(statusCode);
    return result.body;
  }
}
