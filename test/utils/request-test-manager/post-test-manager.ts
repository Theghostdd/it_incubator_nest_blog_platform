import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import { AnyObject } from 'mongoose';
import request from 'supertest';
import {
  IPostCreateModel,
  IPostUpdateModel,
} from '../../models/post/interfaces';

export class PostTestManager {
  private readonly apiPrefix: string;
  private readonly postEndpoint: string;
  private readonly commentEndpoint: string;

  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.postEndpoint = `${this.apiPrefix}/${apiPrefixSettings.POST.posts}`;
    this.commentEndpoint = `${apiPrefixSettings.POST.comments}`;
  }
  async createPost(postModel: IPostCreateModel, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.postEndpoint}`)
      .send(postModel)
      .expect(statusCode);
    return result.body;
  }

  async getPost(id: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.postEndpoint}/${id}`)
      .expect(statusCode);
    return result.body;
  }

  async getPosts(query: AnyObject, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.postEndpoint}`)
      .query(query)
      .expect(statusCode);
    return result.body;
  }

  async getCommentsByPostId(id: string, query: AnyObject, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.postEndpoint}/${id}/${this.commentEndpoint}`)
      .query(query)
      .expect(statusCode);
    return result.body;
  }

  async deletePost(id: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.postEndpoint}/${id}`)
      .expect(statusCode);
    return result.body;
  }

  async updatePost(
    id: string,
    updateModel: IPostUpdateModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.postEndpoint}/${id}`)
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }
}
