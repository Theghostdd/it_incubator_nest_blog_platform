import { ITestSettings } from '../../settings/interfaces';
import { initSettings } from '../../settings/test-settings';
import { PostService } from '../../../src/features/post/application/post-service';
import {
  IPostCreateModel,
  IPostInsertModel,
  IPostUpdateModel,
} from '../../models/post/interfaces';
import { IBlogInsertModel } from '../../models/blog/interfaces';
import { AppResultType } from '../../../src/base/types/types';
import { AppResult } from '../../../src/base/enum/app-result.enum';
import { Types } from 'mongoose';

describe('Post', () => {
  let postService: PostService;
  let testSettings: ITestSettings;
  let postCreateModel: IPostCreateModel;
  let postInsertModel: IPostInsertModel;
  let postUpdateModel: IPostUpdateModel;
  let blogInsertModel: IBlogInsertModel;

  beforeAll(async () => {
    testSettings = await initSettings();
    postService = testSettings.testingAppModule.get<PostService>(PostService);
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    blogInsertModel =
      testSettings.testModels.blogTestModel.getBlogInsertModel();
    postCreateModel =
      testSettings.testModels.postTestModel.getPostCreateModel();
    postInsertModel =
      testSettings.testModels.postTestModel.getPostInsertModel();
    postUpdateModel =
      testSettings.testModels.postTestModel.getPostUpdateModel();
  });

  describe('Create post', () => {
    it('should create post by blog id', async () => {
      const { insertedId: blogId } = await testSettings.dataBase.dbInsertOne(
        'blogs',
        blogInsertModel,
      );
      postCreateModel.blogId = blogId.toString();

      const result: AppResultType<string> =
        await postService.createPostByBlogId(postCreateModel);

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: expect.any(String),
      });

      const post = await testSettings.dataBase.dbFindOne('posts', {
        _id: new Types.ObjectId(result.data),
      });
      expect(post).toEqual({
        _id: expect.any(Types.ObjectId),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: postCreateModel.blogId,
        createdAt: expect.any(String),
        blogName: blogInsertModel.name,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: expect.any(Number),
      });
    });

    it('should not create post by blog id, blog not found', async () => {
      postCreateModel.blogId = '66c4e15b0520745731561266';

      const result: AppResultType<string> =
        await postService.createPostByBlogId(postCreateModel);

      expect(result).toEqual({
        appResult: AppResult.NotFound,
        data: null,
      });

      const posts = await testSettings.dataBase.dbFindAll('posts');
      expect(posts).toHaveLength(0);
    });
  });

  describe('Delete post', () => {
    it('should delete post by id', async () => {
      const { insertedId: postId } = await testSettings.dataBase.dbInsertOne(
        'posts',
        postInsertModel,
      );

      const result: AppResultType = await postService.deletePostById(
        postId.toString(),
      );
      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const posts = await testSettings.dataBase.dbFindAll('posts');
      expect(posts).toHaveLength(0);
    });

    it('should not delete post by id, post not found', async () => {
      const result: AppResultType = await postService.deletePostById(
        '66c4e15b0520745731561266',
      );
      expect(result).toEqual({
        appResult: AppResult.NotFound,
        data: null,
      });
    });
  });

  describe('Update post', () => {
    it('should update post by id', async () => {
      const { insertedId: postId } = await testSettings.dataBase.dbInsertOne(
        'posts',
        postInsertModel,
      );

      const result: AppResultType = await postService.updatePostById(
        postId.toString(),
        postUpdateModel,
      );
      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const post = await testSettings.dataBase.dbFindOne('posts', {
        _id: new Types.ObjectId(postId),
      });
      expect(post.title).not.toBe(postInsertModel.title);
      expect(post.shortDescription).not.toBe(postInsertModel.shortDescription);
      expect(post.content).not.toBe(postInsertModel.content);
      expect(post.blogName).toBe(postInsertModel.blogName);
      expect(post.blogId).toBe(postInsertModel.blogId);
    });

    it('should not update post by id, post not found', async () => {
      const result: AppResultType = await postService.updatePostById(
        '66c4e15b0520745731561266',
        postUpdateModel,
      );
      expect(result).toEqual({
        appResult: AppResult.NotFound,
        data: null,
      });
    });
  });
});
