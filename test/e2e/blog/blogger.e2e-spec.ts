import { BlogTestManager } from '../../utils/request-test-manager/blog-test-manager';
import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import {
  IBlogCreateModel,
  IBlogPostCreateModel,
  IBlogUpdateModel,
} from '../../models/blog/interfaces';
import {
  APIErrorsMessageType,
  AuthorizationUserResponseModel,
} from '../../../src/base/types/types';
import { BasePagination } from '../../../src/base/pagination/base-pagination';
import { BaseSorting } from '../../../src/base/sorting/base-sorting';
import { APISettings } from '../../../src/settings/api-settings';
import { BlogOutputModel } from '../../../src/features/blog-platform/blog/api/models/output/blog-output.model';
import { BlogSortingQuery } from '../../../src/features/blog-platform/blog/api/models/input/blog-input.model';
import { PostOutputModel } from '../../../src/features/blog-platform/post/api/models/output/post-output.model';
import { PostTestManager } from '../../utils/request-test-manager/post-test-manager';
import { IPostUpdateModel } from '../../models/post/interfaces';
import { UserTestManager } from '../../utils/request-test-manager/user-test-manager';
import {
  IUserCreateTestModel,
  IUserLoginTestModel,
} from '../../models/user/interfaces';
import { AuthTestManager } from '../../utils/request-test-manager/auth-test-manager';

describe('Blogger e2e', () => {
  let blogTestManager: BlogTestManager;
  let testSettings: ITestSettings;
  let blogCreateModel: IBlogCreateModel;
  let blogUpdateModel: IBlogUpdateModel;
  let blogPostCreateModel: IBlogPostCreateModel;
  let apiSettings: APISettings;
  let login: string;
  let password: string;
  let adminAuthToken: string;
  let postTestManager: PostTestManager;
  let postUpdateModel: IPostUpdateModel;
  let userTestManager: UserTestManager;
  let userCreateModel: IUserCreateTestModel;
  let userTwoCreateModel: IUserCreateTestModel;
  let authTestManager: AuthTestManager;
  let userLoginModel: IUserLoginTestModel;
  let userTwoLoginModel: IUserLoginTestModel;
  let userId1: string;
  let userId2: string;
  let accessTokenUser1: string;
  let accessTokenUser2: string;

  beforeAll(async () => {
    testSettings = await initSettings();
    apiSettings = testSettings.configService.get('apiSettings', {
      infer: true,
    });

    login = apiSettings.SUPER_ADMIN_AUTH.login;
    password = apiSettings.SUPER_ADMIN_AUTH.password;
    adminAuthToken = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
  });

  afterAll(async () => {
    await testSettings.app.close();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    blogTestManager = testSettings.testManager.blogTestManager;
    blogCreateModel =
      testSettings.testModels.blogTestModel.getBlogCreateModel();
    blogUpdateModel =
      testSettings.testModels.blogTestModel.getBlogUpdateModel();
    blogPostCreateModel =
      testSettings.testModels.blogTestModel.getBlogPostCreateModel();
    postTestManager = testSettings.testManager.postTestManager;
    postUpdateModel =
      testSettings.testModels.postTestModel.getPostUpdateModel();
    userTestManager = testSettings.testManager.userTestManager;
    authTestManager = testSettings.testManager.authTestManager;
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
    userTwoCreateModel = {
      login: 'user22',
      email: 'user22@gmail.com',
      password: 'user22',
    };
    userLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
    userTwoLoginModel = {
      loginOrEmail: userTwoCreateModel.login,
      password: userTwoCreateModel.password,
    };
  });

  const createAndAuth2User = async () => {
    const result1 = await userTestManager.createUser(
      userCreateModel,
      adminAuthToken,
      201,
    );
    userId1 = result1.id;
    const result2 = await userTestManager.createUser(
      userTwoCreateModel,
      adminAuthToken,
      201,
    );
    userId2 = result2.id;

    const authUser1: AuthorizationUserResponseModel =
      await authTestManager.loginAndCheckCookie(userLoginModel, 200);
    const accessTokenUser1Auth = authUser1.accessToken;
    const authUser2: AuthorizationUserResponseModel =
      await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
    const accessTokenUser2Auth = authUser2.accessToken;

    accessTokenUser1 = accessTokenUser1Auth;
    accessTokenUser2 = accessTokenUser2Auth;
  };

  describe('Create blog by blogger', () => {
    it('should create blog', async () => {
      await createAndAuth2User();

      const result: BlogOutputModel = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      expect(result).toEqual({
        id: expect.any(String),
        name: blogCreateModel.name,
        description: blogCreateModel.description,
        websiteUrl: blogCreateModel.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('should not create blog, bad input data', async () => {
      await createAndAuth2User();
      const result: APIErrorsMessageType =
        await blogTestManager.createBlogByBlogger(
          { name: '', description: '', websiteUrl: '' },
          accessTokenUser1,
          400,
        );

      expect(result).toEqual({
        errorsMessages: [
          {
            field: 'name',
            message: expect.any(String),
          },
          {
            field: 'description',
            message: expect.any(String),
          },
          {
            field: 'websiteUrl',
            message: expect.any(String),
          },
        ],
      });

      const withName: APIErrorsMessageType =
        await blogTestManager.createBlogByBlogger(
          {
            name: '',
            description: 'description',
            websiteUrl: 'https://www.google.com',
          },
          accessTokenUser1,
          400,
        );
      expect(withName).toEqual({
        errorsMessages: [
          {
            field: 'name',
            message: expect.any(String),
          },
        ],
      });

      const withDescription: APIErrorsMessageType =
        await blogTestManager.createBlogByBlogger(
          {
            name: 'nameBlog',
            description: '',
            websiteUrl: 'https://www.google.com',
          },
          accessTokenUser1,
          400,
        );
      expect(withDescription).toEqual({
        errorsMessages: [
          {
            field: 'description',
            message: expect.any(String),
          },
        ],
      });

      const withWebsiteUrl: APIErrorsMessageType =
        await blogTestManager.createBlogByBlogger(
          {
            name: 'nameBlog',
            description: 'description',
            websiteUrl: 'google',
          },
          accessTokenUser1,
          400,
        );
      expect(withWebsiteUrl).toEqual({
        errorsMessages: [
          {
            field: 'websiteUrl',
            message: expect.any(String),
          },
        ],
      });

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(0);
    });

    it('should not create blog, unauthorized', async () => {
      await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        'accessTokenUser1',
        401,
      );
      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(0);
    });
  });

  describe('Delete blog by blogger', () => {
    it('should delete blog by id', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      await blogTestManager.deleteBlogByBlogger(blogId, accessTokenUser1, 204);

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(0);
    });

    it('should not delete blog by id, blog not found', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      const getBlogs1: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs1.items).toHaveLength(1);

      await blogTestManager.deleteBlogByBlogger(blogId, accessTokenUser1, 204);
      await blogTestManager.deleteBlogByBlogger(blogId, accessTokenUser1, 404);

      const getBlogs2: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs2.items).toHaveLength(0);
    });

    it('should not delete blog by id, unauthorized', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      await blogTestManager.deleteBlogByBlogger(
        blogId,
        'accessTokenUser1',
        401,
      );

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(1);
    });

    it('should not delete blog by id, forbidden', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      await blogTestManager.deleteBlogByBlogger(blogId, accessTokenUser2, 403);

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(1);
    });
  });

  describe('Update blog by blogger', () => {
    it('should update blog by id', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.updateBlogByBlogger(
        blogId,
        blogUpdateModel,
        accessTokenUser1,
        204,
      );

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(1);
      expect(getBlogs.items[0].name).not.toBe(blogCreateModel.name);
      expect(getBlogs.items[0].description).not.toBe(
        blogCreateModel.description,
      );
      expect(getBlogs.items[0].websiteUrl).not.toBe(blogCreateModel.websiteUrl);
    });

    it('should not update blog, bad input data', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const result: APIErrorsMessageType =
        await blogTestManager.updateBlogByBlogger(
          blogId.toString(),
          { name: '', description: '', websiteUrl: '' },
          accessTokenUser1,
          400,
        );
      expect(result).toEqual({
        errorsMessages: [
          {
            field: 'name',
            message: expect.any(String),
          },
          {
            field: 'description',
            message: expect.any(String),
          },
          {
            field: 'websiteUrl',
            message: expect.any(String),
          },
        ],
      });

      const withName: APIErrorsMessageType =
        await blogTestManager.updateBlogByBlogger(
          blogId.toString(),
          {
            name: '',
            description: 'description',
            websiteUrl: 'https://www.google.com',
          },
          accessTokenUser1,
          400,
        );
      expect(withName).toEqual({
        errorsMessages: [
          {
            field: 'name',
            message: expect.any(String),
          },
        ],
      });

      const withDescription: APIErrorsMessageType =
        await blogTestManager.updateBlogByBlogger(
          blogId.toString(),
          {
            name: 'nameBlog',
            description: '',
            websiteUrl: 'https://www.google.com',
          },
          accessTokenUser1,
          400,
        );
      expect(withDescription).toEqual({
        errorsMessages: [
          {
            field: 'description',
            message: expect.any(String),
          },
        ],
      });

      const withWebsiteUrl: APIErrorsMessageType =
        await blogTestManager.updateBlogByBlogger(
          blogId.toString(),
          {
            name: 'nameBlog',
            description: 'description',
            websiteUrl: 'google',
          },
          accessTokenUser1,
          400,
        );
      expect(withWebsiteUrl).toEqual({
        errorsMessages: [
          {
            field: 'websiteUrl',
            message: expect.any(String),
          },
        ],
      });

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(1);
      expect(getBlogs.items[0].name).toBe(blogCreateModel.name);
      expect(getBlogs.items[0].description).toBe(blogCreateModel.description);
      expect(getBlogs.items[0].websiteUrl).toBe(blogCreateModel.websiteUrl);
    });

    it('should not update blog by id, blog not found', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.deleteBlogByBlogger(blogId, accessTokenUser1, 204);

      await blogTestManager.updateBlogByBlogger(
        blogId.toString(),
        blogUpdateModel,
        accessTokenUser1,
        404,
      );

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(0);
    });

    it('should not update blog by id, unauthorized', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.updateBlogByBlogger(
        blogId.toString(),
        blogUpdateModel,
        'accessTokenUser1',
        401,
      );

      const getBlogs: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs.items).toHaveLength(1);
      expect(getBlogs.items[0].name).toBe(blogCreateModel.name);
      expect(getBlogs.items[0].description).toBe(blogCreateModel.description);
      expect(getBlogs.items[0].websiteUrl).toBe(blogCreateModel.websiteUrl);
    });

    it('should not update blog by id, forbidden', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.updateBlogByBlogger(
        blogId.toString(),
        blogUpdateModel,
        accessTokenUser1,
        204,
      );

      const getBlogs1: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs1.items).toHaveLength(1);
      expect(getBlogs1.items[0].name).not.toBe(blogCreateModel.name);
      expect(getBlogs1.items[0].description).not.toBe(
        blogCreateModel.description,
      );
      expect(getBlogs1.items[0].websiteUrl).not.toBe(
        blogCreateModel.websiteUrl,
      );

      await blogTestManager.updateBlogByBlogger(
        blogId.toString(),
        blogUpdateModel,
        accessTokenUser2,
        403,
      );

      const getBlogs2: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(getBlogs2.items).toHaveLength(1);
      expect(getBlogs2.items[0].name).toBe(blogUpdateModel.name);
      expect(getBlogs2.items[0].description).toBe(blogUpdateModel.description);
      expect(getBlogs2.items[0].websiteUrl).toBe(blogUpdateModel.websiteUrl);
    });
  });

  describe('Create post by blog id', () => {
    it('should create post by blog id', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const result: PostOutputModel =
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          blogPostCreateModel,
          accessTokenUser1,
          201,
        );

      expect(result).toEqual({
        id: expect.any(String),
        title: blogPostCreateModel.title,
        shortDescription: blogPostCreateModel.shortDescription,
        content: blogPostCreateModel.content,
        blogId: blogId.toString(),
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('should not create post by blog id, blog not found', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      await blogTestManager.deleteBlogByBlogger(blogId, accessTokenUser1, 204);

      await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        404,
      );
    });

    it('should not create post by blog id, bad input data', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const result: APIErrorsMessageType =
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          { title: '', shortDescription: '', content: '' },
          accessTokenUser1,
          400,
        );
      expect(result).toEqual({
        errorsMessages: [
          {
            field: 'title',
            message: expect.any(String),
          },
          {
            field: 'shortDescription',
            message: expect.any(String),
          },
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });

      const withTitle: APIErrorsMessageType =
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          {
            title: '',
            shortDescription: 'shortDescription',
            content: 'content',
          },
          accessTokenUser1,
          400,
        );
      expect(withTitle).toEqual({
        errorsMessages: [
          {
            field: 'title',
            message: expect.any(String),
          },
        ],
      });

      const withShortDescription: APIErrorsMessageType =
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          {
            title: 'title',
            shortDescription: '',
            content: 'content',
          },
          accessTokenUser1,
          400,
        );
      expect(withShortDescription).toEqual({
        errorsMessages: [
          {
            field: 'shortDescription',
            message: expect.any(String),
          },
        ],
      });

      const withContent: APIErrorsMessageType =
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          {
            title: 'title',
            shortDescription: 'shortDescription',
            content: '',
          },
          accessTokenUser1,
          400,
        );
      expect(withContent).toEqual({
        errorsMessages: [
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });

      const posts: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(posts.items).toHaveLength(0);
    });

    it('should not create post by blog id, unauthorized', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        'accessTokenUser1',
        401,
      );

      const posts: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(posts.items).toHaveLength(0);
    });

    it('should not create post by blog id, forbidden', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser2,
        403,
      );
      const posts: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(posts.items).toHaveLength(0);
    });
  });

  describe('Delete post by blog id and post id', () => {
    it('should delete post by id and blog id', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.deletePostByBlogIdByBlogger(
        blogId,
        postId,
        accessTokenUser1,
        204,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(result.items).toHaveLength(0);
    });

    it('should not delete post by id and blog id, post not found', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.deletePostByBlogIdByBlogger(
        blogId,
        2833,
        accessTokenUser1,
        404,
      );
    });

    it('should not delete post by id and blog id, blog not found', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.deleteBlogByBlogger(blogId, accessTokenUser1, 204);

      await blogTestManager.deletePostByBlogIdByBlogger(
        blogId,
        postId,
        accessTokenUser1,
        404,
      );
    });

    it('should not delete post by id and blog id, unauthorized', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.deletePostByBlogIdByBlogger(
        blogId,
        postId,
        'accessTokenUser1',
        401,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(result.items).toHaveLength(1);
    });

    it('should not delete post by id and blog id, forbidden', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.deletePostByBlogIdByBlogger(
        blogId,
        postId,
        accessTokenUser2,
        403,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(result.items).toHaveLength(1);
    });
  });

  describe('Update post by blog id', () => {
    it('should update post by id and blog id', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.updatePostByBlogIdByBlogger(
        blogId,
        postId,
        postUpdateModel,
        accessTokenUser1,
        204,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(result.items[0].title).not.toBe(blogPostCreateModel.title);
      expect(result.items[0].content).not.toBe(blogPostCreateModel.content);
      expect(result.items[0].shortDescription).not.toBe(
        blogPostCreateModel.shortDescription,
      );
    });

    it('should not update post by id and blog id, bad input data', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      const result: APIErrorsMessageType =
        await blogTestManager.updatePostByBlogIdByBlogger(
          blogId,
          postId,
          { title: '', shortDescription: '', content: '' },
          accessTokenUser1,
          400,
        );
      expect(result).toEqual({
        errorsMessages: [
          {
            field: 'title',
            message: expect.any(String),
          },
          {
            field: 'shortDescription',
            message: expect.any(String),
          },
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });

      const withTitle: APIErrorsMessageType =
        await blogTestManager.updatePostByBlogIdByBlogger(
          blogId,
          postId,
          {
            title: '',
            shortDescription: 'shortDescription',
            content: 'content',
          },
          accessTokenUser1,
          400,
        );
      expect(withTitle).toEqual({
        errorsMessages: [
          {
            field: 'title',
            message: expect.any(String),
          },
        ],
      });

      const withShortDescription: APIErrorsMessageType =
        await blogTestManager.updatePostByBlogIdByBlogger(
          blogId,
          postId,
          {
            title: 'title',
            shortDescription: '',
            content: 'content',
          },
          accessTokenUser1,
          400,
        );
      expect(withShortDescription).toEqual({
        errorsMessages: [
          {
            field: 'shortDescription',
            message: expect.any(String),
          },
        ],
      });

      const withContent: APIErrorsMessageType =
        await blogTestManager.updatePostByBlogIdByBlogger(
          blogId,
          postId,
          {
            title: 'title',
            shortDescription: 'shortDescription',
            content: '',
          },
          accessTokenUser1,
          400,
        );
      expect(withContent).toEqual({
        errorsMessages: [
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });

      const posts: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(posts.items[0].title).toBe(blogPostCreateModel.title);
      expect(posts.items[0].content).toBe(blogPostCreateModel.content);
      expect(posts.items[0].shortDescription).toBe(
        blogPostCreateModel.shortDescription,
      );
    });

    it('should not update post by id, post not found', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.deletePostByBlogIdByBlogger(
        blogId,
        postId,
        accessTokenUser1,
        204,
      );

      await blogTestManager.updatePostByBlogIdByBlogger(
        blogId,
        postId,
        postUpdateModel,
        accessTokenUser1,
        404,
      );
    });

    it('should not update post by id, unauthorized', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.updatePostByBlogIdByBlogger(
        blogId,
        postId,
        postUpdateModel,
        'accessTokenUser1',
        401,
      );

      const posts: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(posts.items[0].title).toBe(blogPostCreateModel.title);
      expect(posts.items[0].content).toBe(blogPostCreateModel.content);
      expect(posts.items[0].shortDescription).toBe(
        blogPostCreateModel.shortDescription,
      );
    });

    it('should not update post by id, forbidden', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogIdByBlogger(
        blogId,
        blogPostCreateModel,
        accessTokenUser1,
        201,
      );

      await blogTestManager.updatePostByBlogIdByBlogger(
        blogId,
        postId,
        postUpdateModel,
        accessTokenUser2,
        403,
      );

      const posts: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );
      expect(posts.items[0].title).toBe(blogPostCreateModel.title);
      expect(posts.items[0].content).toBe(blogPostCreateModel.content);
      expect(posts.items[0].shortDescription).toBe(
        blogPostCreateModel.shortDescription,
      );
    });
  });

  describe('Get blogs', () => {
    it('should get blogs id without query', async () => {
      await createAndAuth2User();
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + i },
          accessTokenUser1,
          201,
        );
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get blogs with pagination, page size: 11', async () => {
      await createAndAuth2User();
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + i },
          accessTokenUser1,
          201,
        );
      }
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger(
          {
            pageSize: 11,
          } as BlogSortingQuery,
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 11,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get blog-sa with pagination, page number: 2', async () => {
      await createAndAuth2User();
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + i },
          accessTokenUser1,
          201,
        );
      }
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger(
          {
            pageNumber: 2,
          } as BlogSortingQuery,
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get blog-sa with pagination, search name term', async () => {
      await createAndAuth2User();
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + i },
          accessTokenUser1,
          201,
        );
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger(
          {
            searchNameTerm: 'nameBlog1',
          } as BlogSortingQuery,
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            name: 'nameBlog10',
            description: blogCreateModel.description,
            websiteUrl: blogCreateModel.websiteUrl,
            createdAt: expect.any(String),
            isMembership: false,
          },
          {
            id: expect.any(String),
            name: 'nameBlog1',
            description: blogCreateModel.description,
            websiteUrl: blogCreateModel.websiteUrl,
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });

    it('should get empty blogs array', async () => {
      await createAndAuth2User();
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);
      expect(result.items).toHaveLength(0);
      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should get blogs with sorting by name, asc', async () => {
      await createAndAuth2User();
      const createdBlogArray = [];
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + (i - 1) },
          accessTokenUser1,
          201,
        );
        createdBlogArray.push({
          ...blogCreateModel,
          name: 'nameBlog' + (i - 1),
        });
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger(
          {
            sortBy: 'name',
            sortDirection: 'asc',
            pageSize: 20,
          } as BlogSortingQuery,
          accessTokenUser1,
          200,
        );

      const mapResult = result.items.map((item) => {
        return {
          name: item.name,
          description: item.description,
          websiteUrl: item.websiteUrl,
        };
      });

      const mapInsertModelAndSortByAsc = createdBlogArray
        .map((item) => {
          return {
            name: item.name,
            description: item.description,
            websiteUrl: item.websiteUrl,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      expect(mapResult).toEqual(mapInsertModelAndSortByAsc);
    });

    it('should not get blogs id, unauthorized', async () => {
      await createAndAuth2User();
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + i },
          accessTokenUser1,
          201,
        );
      }

      await blogTestManager.getBlogsByBlogger({}, 'accessTokenUser1', 401);

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsByBlogger({}, accessTokenUser1, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });
  });

  describe('Get posts by blog id', () => {
    it('should get posts by blog id without query', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          blogPostCreateModel,
          accessTokenUser1,
          201,
        );
      }

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get posts by blog id with pagination, page size: 11', async () => {
      await createAndAuth2User();

      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          blogPostCreateModel,
          accessTokenUser1,
          201,
        );
      }
      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {
            pageSize: 11,
          } as BaseSorting,
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 11,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get posts by blog id with pagination, page number: 2', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          blogPostCreateModel,
          accessTokenUser1,
          201,
        );
      }

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {
            pageNumber: 2,
          } as BaseSorting,
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get empty posts array by blog id', async () => {
      await createAndAuth2User();

      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );

      expect(result.items).toHaveLength(0);
      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should get posts by blog id with sorting by name, asc', async () => {
      await createAndAuth2User();

      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );
      const createdPostsArray = [];
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          { ...blogPostCreateModel, title: 'titleE' + (i - 1) },
          accessTokenUser1,
          201,
        );
        createdPostsArray.push({
          ...blogPostCreateModel,
          title: 'titleE' + (i - 1),
        });
      }

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {
            sortBy: 'title',
            sortDirection: 'asc',
            pageSize: 20,
          } as BaseSorting,
          accessTokenUser1,
          200,
        );

      const mapResult = result.items.map((item) => {
        return {
          title: item.title,
          shortDescription: item.shortDescription,
          content: item.content,
        };
      });

      const mapInsertModelAndSortByAsc = createdPostsArray
        .map((item) => {
          return {
            title: item.title,
            shortDescription: item.shortDescription,
            content: item.content,
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title));

      expect(mapResult).toEqual(mapInsertModelAndSortByAsc);
    });

    it('should not get posts by blog id, unauthorized', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          blogPostCreateModel,
          accessTokenUser1,
          201,
        );
      }

      await blogTestManager.getPostByBlogIdByBlogger(
        blogId,
        {},
        'accessTokenUser1',
        401,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should not get posts by blog id, forbidden', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlogByBlogger(
        blogCreateModel,
        accessTokenUser1,
        201,
      );

      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogIdByBlogger(
          blogId,
          blogPostCreateModel,
          accessTokenUser1,
          201,
        );
      }

      await blogTestManager.getPostByBlogIdByBlogger(
        blogId,
        {},
        accessTokenUser2,
        403,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogIdByBlogger(
          blogId,
          {},
          accessTokenUser1,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });
  });
});
