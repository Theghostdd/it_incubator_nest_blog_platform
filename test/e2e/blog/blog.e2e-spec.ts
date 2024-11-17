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
import {
  BlogOutputModel,
  BlogWithOwnerInfoOutputModel,
} from '../../../src/features/blog-platform/blog/api/models/output/blog-output.model';
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

describe('Blog e2e', () => {
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

  describe('Get blogs', () => {
    it('should get blogs id without query', async () => {
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + i },
          adminAuthToken,
          201,
        );
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogs({}, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get blogs with pagination, page size: 11', async () => {
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + i },
          adminAuthToken,
          201,
        );
      }
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogs(
          {
            pageSize: 11,
          } as BlogSortingQuery,
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
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + i },
          adminAuthToken,
          201,
        );
      }
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogs(
          {
            pageNumber: 2,
          } as BlogSortingQuery,
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
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + i },
          adminAuthToken,
          201,
        );
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogs(
          {
            searchNameTerm: 'nameBlog1',
          } as BlogSortingQuery,
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
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogs({}, 200);
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
      const createdBlogArray = [];
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + (i - 1) },
          adminAuthToken,
          201,
        );
        createdBlogArray.push({
          ...blogCreateModel,
          name: 'nameBlog' + (i - 1),
        });
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogs(
          {
            sortBy: 'name',
            sortDirection: 'asc',
            pageSize: 20,
          } as BlogSortingQuery,
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
  });

  describe('Create blog-sa', () => {
    it('should create blog-sa', async () => {
      const result: BlogOutputModel = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
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

    it('should not create blog-sa, bad input data', async () => {
      const result: APIErrorsMessageType = await blogTestManager.createBlog(
        { name: '', description: '', websiteUrl: '' },
        adminAuthToken,
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

      const withName: APIErrorsMessageType = await blogTestManager.createBlog(
        {
          name: '',
          description: 'description',
          websiteUrl: 'https://www.google.com',
        },
        adminAuthToken,
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
        await blogTestManager.createBlog(
          {
            name: 'nameBlog',
            description: '',
            websiteUrl: 'https://www.google.com',
          },
          adminAuthToken,
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
        await blogTestManager.createBlog(
          {
            name: 'nameBlog',
            description: 'description',
            websiteUrl: 'google',
          },
          adminAuthToken,
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
    });
  });

  describe('Delete blog-sa', () => {
    it('should delete blog-sa by id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.deleteBlog(blogId, adminAuthToken, 204);
    });

    it('should not delete blog-sa by id, blog-sa not found', async () => {
      await blogTestManager.deleteBlog(
        '66bf39c8f855a5438d02adbf',
        adminAuthToken,
        404,
      );
    });

    it('should delete blog-sa by id, and should not delete again, not found', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.deleteBlog(blogId, adminAuthToken, 204);
      await blogTestManager.deleteBlog(blogId, adminAuthToken, 404);
    });
  });

  describe('Update blog-sa', () => {
    it('should update blog-sa by id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.updateBlog(
        blogId,
        blogUpdateModel,
        adminAuthToken,
        204,
      );

      const result: BlogOutputModel = await blogTestManager.getBlog(
        blogId,
        200,
      );
      expect(result.name).not.toBe(blogCreateModel.name);
      expect(result.description).not.toBe(blogCreateModel.description);
      expect(result.websiteUrl).not.toBe(blogCreateModel.websiteUrl);
    });

    it('should not update blog-sa, bad input data', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const result: APIErrorsMessageType = await blogTestManager.updateBlog(
        blogId.toString(),
        { name: '', description: '', websiteUrl: '' },
        adminAuthToken,
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

      const withName: APIErrorsMessageType = await blogTestManager.updateBlog(
        blogId.toString(),
        {
          name: '',
          description: 'description',
          websiteUrl: 'https://www.google.com',
        },
        adminAuthToken,
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
        await blogTestManager.updateBlog(
          blogId.toString(),
          {
            name: 'nameBlog',
            description: '',
            websiteUrl: 'https://www.google.com',
          },
          adminAuthToken,
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
        await blogTestManager.updateBlog(
          blogId.toString(),
          {
            name: 'nameBlog',
            description: 'description',
            websiteUrl: 'google',
          },
          adminAuthToken,
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

      const blog: BlogOutputModel = await blogTestManager.getBlog(
        blogId.toString(),
        200,
      );
      expect(blog.name).toBe(blogCreateModel.name);
      expect(blog.description).toBe(blogCreateModel.description);
      expect(blog.websiteUrl).toBe(blogCreateModel.websiteUrl);
    });

    it('should not update blog-sa by id, blog-sa not found', async () => {
      await blogTestManager.updateBlog(
        '66bf39c8f855a5438d02adbf',
        blogUpdateModel,
        adminAuthToken,
        404,
      );
    });
  });

  describe('Create post by blog-sa id', () => {
    it('should create post by blog-sa id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const result: PostOutputModel = await blogTestManager.createPostByBlogId(
        blogId,
        blogPostCreateModel,
        adminAuthToken,
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

    it('should not create post by blog-sa id, blog-sa not found', async () => {
      await blogTestManager.createPostByBlogId(
        '66bf39c8f855a5438d02adbf',
        blogPostCreateModel,
        adminAuthToken,
        404,
      );
    });

    it('should not create post by blog-sa id, bad input data', async () => {
      const result: APIErrorsMessageType =
        await blogTestManager.createPostByBlogId(
          '66bf39c8f855a5438d02adbf',
          { title: '', shortDescription: '', content: '' },
          adminAuthToken,
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
        await blogTestManager.createPostByBlogId(
          '66bf39c8f855a5438d02adbf',
          {
            title: '',
            shortDescription: 'shortDescription',
            content: 'content',
          },
          adminAuthToken,
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
        await blogTestManager.createPostByBlogId(
          '66bf39c8f855a5438d02adbf',
          {
            title: 'title',
            shortDescription: '',
            content: 'content',
          },
          adminAuthToken,
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
        await blogTestManager.createPostByBlogId(
          '66bf39c8f855a5438d02adbf',
          {
            title: 'title',
            shortDescription: 'shortDescription',
            content: '',
          },
          adminAuthToken,
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
    });
  });

  describe('Get posts by blog-sa id', () => {
    it('should get posts by blog-sa id without query', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogId(
          blogId,
          blogPostCreateModel,
          adminAuthToken,
          201,
        );
      }

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogId(blogId, {}, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get posts by blog-sa id with pagination, page size: 11', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogId(
          blogId,
          blogPostCreateModel,
          adminAuthToken,
          201,
        );
      }
      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogId(
          blogId,
          {
            pageSize: 11,
          } as BaseSorting,
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

    it('should get posts by blog-sa id with pagination, page number: 2', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogId(
          blogId,
          blogPostCreateModel,
          adminAuthToken,
          201,
        );
      }

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogId(
          blogId,
          {
            pageNumber: 2,
          } as BaseSorting,
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

    it('should get empty posts array by blog-sa id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogId(blogId, {}, 200);

      expect(result.items).toHaveLength(0);
      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should get posts by blog-sa id with sorting by name, asc', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const createdPostsArray = [];
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createPostByBlogId(
          blogId,
          { ...blogPostCreateModel, title: 'titleE' + (i - 1) },
          adminAuthToken,
          201,
        );
        createdPostsArray.push({
          ...blogPostCreateModel,
          title: 'titleE' + (i - 1),
        });
      }

      const result: BasePagination<PostOutputModel[] | []> =
        await blogTestManager.getPostByBlogId(
          blogId,
          {
            sortBy: 'title',
            sortDirection: 'asc',
            pageSize: 20,
          } as BaseSorting,
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
  });

  describe('Delete post by blog id by super admin', () => {
    it('should delete post by id and blog id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogId(
        blogId,
        blogPostCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.deletePostByBlogId(
        blogId,
        postId,
        adminAuthToken,
        204,
      );
      await postTestManager.getPost(postId, 404);
      await blogTestManager.deletePostByBlogId(
        blogId,
        postId,
        adminAuthToken,
        404,
      );
    });

    it('should not delete post by id and blog id, post not found', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.deletePostByBlogId(
        blogId,
        2833,
        adminAuthToken,
        404,
      );
    });

    it('should not delete post by id and blog id, blog not found', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await blogTestManager.createPostByBlogId(
        blogId,
        blogPostCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.deleteBlog(blogId, adminAuthToken, 204);

      await blogTestManager.deletePostByBlogId(
        blogId,
        postId,
        adminAuthToken,
        404,
      );
    });
  });

  describe('Update post by blog id by super admin', () => {
    it('should update post by id and blog id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogId(
        blogId,
        blogPostCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.updatePostByBlogId(
        blogId,
        postId,
        postUpdateModel,
        adminAuthToken,
        204,
      );

      const result: PostOutputModel = await postTestManager.getPost(
        postId,
        200,
      );
      expect(result.title).not.toBe(blogPostCreateModel.title);
      expect(result.content).not.toBe(blogPostCreateModel.content);
      expect(result.shortDescription).not.toBe(
        blogPostCreateModel.shortDescription,
      );
    });

    it('should not update post by id and blog id, bad input data', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId } = await blogTestManager.createPostByBlogId(
        blogId,
        blogPostCreateModel,
        adminAuthToken,
        201,
      );

      const result: APIErrorsMessageType =
        await blogTestManager.updatePostByBlogId(
          blogId,
          postId,
          { title: '', shortDescription: '', content: '' },
          adminAuthToken,
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
        await blogTestManager.updatePostByBlogId(
          blogId,
          postId,
          {
            title: '',
            shortDescription: 'shortDescription',
            content: 'content',
          },
          adminAuthToken,
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
        await blogTestManager.updatePostByBlogId(
          blogId,
          postId,
          {
            title: 'title',
            shortDescription: '',
            content: 'content',
          },
          adminAuthToken,
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
        await blogTestManager.updatePostByBlogId(
          blogId,
          postId,
          {
            title: 'title',
            shortDescription: 'shortDescription',
            content: '',
          },
          adminAuthToken,
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

      const post: PostOutputModel = await postTestManager.getPost(postId, 200);
      expect(post.title).toBe(blogPostCreateModel.title);
      expect(post.shortDescription).toBe(blogPostCreateModel.shortDescription);
      expect(post.content).toBe(blogPostCreateModel.content);
    });

    it('should not update post by id, post not found', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.updatePostByBlogId(
        blogId,
        23456,
        postUpdateModel,
        adminAuthToken,
        404,
      );
    });
  });

  describe('Bind blog for user', () => {
    it('should create blog and bind for user', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const result1: BasePagination<BlogWithOwnerInfoOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);
      expect(result1.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
        blogOwnerInfo: {
          userId: null,
          userLogin: null,
        },
      });

      await blogTestManager.bindBlogForUser(
        blogId,
        +userId1,
        adminAuthToken,
        204,
      );

      const result2: BasePagination<BlogWithOwnerInfoOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);
      expect(result2.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
        blogOwnerInfo: {
          userId: userId1,
          userLogin: userCreateModel.login,
        },
      });
    });

    it('should not bind blog, blog already binding, bad request', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const result1: BasePagination<BlogWithOwnerInfoOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);
      expect(result1.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
        blogOwnerInfo: {
          userId: null,
          userLogin: null,
        },
      });

      await blogTestManager.bindBlogForUser(
        blogId,
        +userId1,
        adminAuthToken,
        204,
      );
      const result2: BasePagination<BlogWithOwnerInfoOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);
      expect(result2.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
        blogOwnerInfo: {
          userId: userId1,
          userLogin: userCreateModel.login,
        },
      });

      const bindResult = await blogTestManager.bindBlogForUser(
        blogId,
        +userId1,
        adminAuthToken,
        400,
      );

      expect(bindResult).toEqual({
        errorsMessages: [
          {
            field: 'user',
            message: expect.any(String),
          },
        ],
      });

      const result3: BasePagination<BlogWithOwnerInfoOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);
      expect(result3.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
        blogOwnerInfo: {
          userId: userId1,
          userLogin: userCreateModel.login,
        },
      });
    });

    it('should not bind blog for user, unauthorized', async () => {
      await createAndAuth2User();
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.bindBlogForUser(
        blogId,
        +userId1,
        `adminAuthToken`,
        401,
      );

      const result: BasePagination<BlogWithOwnerInfoOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);
      expect(result.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
        blogOwnerInfo: {
          userId: null,
          userLogin: null,
        },
      });
    });

    it('should not bind blog for user, blog not found', async () => {
      await createAndAuth2User();
      await blogTestManager.bindBlogForUser(22, +userId1, adminAuthToken, 404);
    });
  });

  describe('Get blogs with owner info', () => {
    it('should get blogs with owner info, without query', async () => {
      await createAndAuth2User();

      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + i },
          accessTokenUser1,
          201,
        );
      }

      const result: BasePagination<BlogWithOwnerInfoOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
      expect(result.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
        blogOwnerInfo: {
          userId: userId1,
          userLogin: userCreateModel.login,
        },
      });
    });

    it('should get blogs with pagination, page size: 11', async () => {
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + i },
          adminAuthToken,
          201,
        );
      }
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin(
          {
            pageSize: 11,
          } as BlogSortingQuery,
          adminAuthToken,
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

    it('should get blog with pagination, page number: 2', async () => {
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + i },
          adminAuthToken,
          201,
        );
      }
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin(
          {
            pageNumber: 2,
          } as BlogSortingQuery,
          adminAuthToken,
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

    it('should get blog with pagination, search name term', async () => {
      await createAndAuth2User();
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlogByBlogger(
          { ...blogCreateModel, name: 'nameBlog' + i },
          accessTokenUser1,
          201,
        );
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin(
          {
            searchNameTerm: 'nameBlog1',
          } as BlogSortingQuery,
          adminAuthToken,
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
            blogOwnerInfo: {
              userId: userId1,
              userLogin: userCreateModel.login,
            },
          },
          {
            id: expect.any(String),
            name: 'nameBlog1',
            description: blogCreateModel.description,
            websiteUrl: blogCreateModel.websiteUrl,
            createdAt: expect.any(String),
            isMembership: false,
            blogOwnerInfo: {
              userId: userId1,
              userLogin: userCreateModel.login,
            },
          },
        ],
      });
    });

    it('should get empty blogs array', async () => {
      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin({}, adminAuthToken, 200);
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
      const createdBlogArray = [];
      for (let i = 0; i < 11; i++) {
        await blogTestManager.createBlog(
          { ...blogCreateModel, name: 'nameBlog' + (i - 1) },
          adminAuthToken,
          201,
        );
        createdBlogArray.push({
          ...blogCreateModel,
          name: 'nameBlog' + (i - 1),
        });
      }

      const result: BasePagination<BlogOutputModel[] | []> =
        await blogTestManager.getBlogsBySuperAdmin(
          {
            sortBy: 'name',
            sortDirection: 'asc',
            pageSize: 20,
          } as BlogSortingQuery,
          adminAuthToken,
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
  });
});
