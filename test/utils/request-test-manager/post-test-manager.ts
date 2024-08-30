import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import { AnyObject } from 'mongoose';
import request from 'supertest';
import {
  IPostCreateModel,
  IPostUpdateModel,
} from '../../models/post/interfaces';
import { ICommentCreateModel } from '../../models/comments/interfaces';
import { ILikeUpdateModel } from '../../models/like/interfaces';

export class PostTestManager {
  private readonly apiPrefix: string;
  private readonly postEndpoint: string;
  private readonly commentEndpoint: string;
  private readonly likeEndpoint: string;

  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.postEndpoint = `${this.apiPrefix}/${apiPrefixSettings.POST.posts}`;
    this.commentEndpoint = `${apiPrefixSettings.POST.comments}`;
    this.likeEndpoint = `${apiPrefixSettings.POST.like_status}`;
  }
  async createPost(
    postModel: IPostCreateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.postEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(postModel)
      .expect(statusCode);
    return result.body;
  }

  async getPost(id: string, statusCode: number, authorizationToken?: string) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.postEndpoint}/${id}`)
      .set({ authorization: authorizationToken || null })
      .expect(statusCode);
    return result.body;
  }

  async getPosts(
    query: AnyObject,
    statusCode: number,
    authorizationToken?: string,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.postEndpoint}`)
      .set({ authorization: authorizationToken || null })
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

  async deletePost(id: string, authorizationToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.postEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async updatePost(
    id: string,
    updateModel: IPostUpdateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.postEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }

  async createCommentByPostId(
    id: string,
    commentModel: ICommentCreateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.postEndpoint}/${id}/${this.commentEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(commentModel)
      .expect(statusCode);
    return result.body;
  }

  async updatePostLikeStatusByPostId(
    id: string,
    likeModel: ILikeUpdateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.postEndpoint}/${id}/${this.likeEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(likeModel)
      .expect(statusCode);
    return result.body;
  }
}
