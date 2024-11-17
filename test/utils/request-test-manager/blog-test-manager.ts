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
  private readonly bloggerEndpoint: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.blogEndpoint = `${this.apiPrefix}/${apiPrefixSettings.BLOG.blogs}`;
    this.postEndpoint = `${apiPrefixSettings.BLOG.posts}`;
    this.blogAdminEndpoint = `${this.apiPrefix}/${apiPrefixSettings.BLOG.sa_blogs}`;
    this.bloggerEndpoint = `${this.apiPrefix}/${apiPrefixSettings.BLOG.blogger}/${apiPrefixSettings.BLOG.blogs}`;
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

  async createBlogByBlogger(
    blogModel: IBlogCreateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.bloggerEndpoint}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .send(blogModel)
      .expect(statusCode);
    return result.body;
  }

  async deleteBlogByBlogger(
    id: string,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.bloggerEndpoint}/${id}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .expect(statusCode);
    return result.body;
  }

  async updateBlogByBlogger(
    id: string,
    updateModel: IBlogUpdateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.bloggerEndpoint}/${id}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }

  async createPostByBlogIdByBlogger(
    blogId: string,
    postModel: IBlogPostCreateModel,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.bloggerEndpoint}/${blogId}/${this.postEndpoint}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .send(postModel)
      .expect(statusCode);
    return result.body;
  }

  async deletePostByBlogIdByBlogger(
    id: number,
    postId: number,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.bloggerEndpoint}/${id}/${this.postEndpoint}/${postId}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .expect(statusCode);
    return result.body;
  }

  async updatePostByBlogIdByBlogger(
    id: number,
    postId: number,
    updateModel: Omit<IPostUpdateModel, 'blogId'>,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.bloggerEndpoint}/${id}/${this.postEndpoint}/${postId}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }

  async getBlogsByBlogger(
    query: AnyObject,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.bloggerEndpoint}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .query(query)
      .expect(statusCode);
    return result.body;
  }

  async getPostByBlogIdByBlogger(
    blogId: string,
    query: AnyObject,
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.bloggerEndpoint}/${blogId}/${this.postEndpoint}`)
      .set({ authorization: `Bearer ${authorizationToken}` })
      .query(query)
      .expect(statusCode);
    return result.body;
  }
}
