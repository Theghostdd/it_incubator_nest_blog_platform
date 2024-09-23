import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import { AnyObject } from 'mongoose';
import request from 'supertest';
import {
  IBlogCreateModel,
  IBlogPostCreateModel,
  IBlogUpdateModel,
} from '../../models/blog/interfaces';
import { IPostUpdateModel } from '../../models/post/interfaces';

export class BlogTestManager {
  private readonly apiPrefix: string;
  private readonly blogEndpoint: string;
  private readonly postEndpoint: string;
  private readonly blogAdminEndpoint: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.blogEndpoint = `${this.apiPrefix}/${apiPrefixSettings.BLOG.blogs}`;
    this.postEndpoint = `${apiPrefixSettings.BLOG.posts}`;
    this.blogAdminEndpoint = `${this.apiPrefix}/${apiPrefixSettings.BLOG.sa_blogs}`;
  }
  async createBlog(
    blogModel: IBlogCreateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.blogAdminEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(blogModel)
      .expect(statusCode);
    return result.body;
  }

  async getBlog(id: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.blogEndpoint}/${id}`)
      .expect(statusCode);
    return result.body;
  }

  async getBlogs(query: AnyObject, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.blogEndpoint}`)
      .query(query)
      .expect(statusCode);
    return result.body;
  }

  async deleteBlog(id: string, authorizationToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.blogAdminEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async updateBlog(
    id: string,
    updateModel: IBlogUpdateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.blogAdminEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }

  async createPostByBlogId(
    blogId: string,
    postModel: IBlogPostCreateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.blogAdminEndpoint}/${blogId}/${this.postEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(postModel)
      .expect(statusCode);
    return result.body;
  }

  async getPostByBlogId(blogId: string, query: AnyObject, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.blogEndpoint}/${blogId}/${this.postEndpoint}`)
      .query(query)
      .expect(statusCode);
    return result.body;
  }

  async updatePostByBlogId(
    id: number,
    postId: number,
    updateModel: Omit<IPostUpdateModel, 'blogId'>,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.blogAdminEndpoint}/${id}/${this.postEndpoint}/${postId}`)
      .set({ authorization: authorizationToken })
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }

  async deletePostByBlogId(
    id: number,
    postId: number,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.blogAdminEndpoint}/${id}/${this.postEndpoint}/${postId}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }
}
