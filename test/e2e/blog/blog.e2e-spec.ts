import { BlogTestManager } from '../../utils/request-test-manager/blog-test-manager';
import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import { BlogOutputModel } from '../../../src/features/blog-platform/blog/api/models/output/blog-output.model';
import {
  IBlogCreateModel,
  IBlogPostCreateModel,
  IBlogUpdateModel,
} from '../../models/blog/interfaces';
import { APIErrorsMessageType } from '../../../src/base/types/types';
import { BasePagination } from '../../../src/base/pagination/base-pagination';
import { PostOutputModel } from '../../../src/features/blog-platform/post/api/models/output/post-output.model';
import { BaseSorting } from '../../../src/base/sorting/base-sorting';
import { APISettings } from '../../../src/settings/api-settings';
import { BlogSortingQuery } from '../../../src/features/blog-platform/blog/api/models/input/blog-input.model';

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
  });

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

    it('should get blog with pagination, page number: 2', async () => {
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

    it('should get blog with pagination, search name term', async () => {
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

  describe('Get blog', () => {
    it('should get blog by id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const result: BlogOutputModel = await blogTestManager.getBlog(
        blogId,
        200,
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

    it('should not get blog by id, blog not found', async () => {
      await blogTestManager.getBlog('66bf39c8f855a5438d02adbf', 404);
    });
  });

  describe('Create blog', () => {
    it('should create blog', async () => {
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

    it('should not create blog, bad input data', async () => {
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

  describe('Delete blog', () => {
    it('should delete blog by id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.deleteBlog(blogId, adminAuthToken, 204);
    });

    it('should not delete blog by id, blog not found', async () => {
      await blogTestManager.deleteBlog(
        '66bf39c8f855a5438d02adbf',
        adminAuthToken,
        404,
      );
    });

    it('should delete blog by id, and should not delete again, not found', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      await blogTestManager.deleteBlog(blogId, adminAuthToken, 204);
      await blogTestManager.deleteBlog(blogId, adminAuthToken, 404);
    });
  });

  describe('Update blog', () => {
    it('should update blog by id', async () => {
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

    it('should not update blog, bad input data', async () => {
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

    it('should not update blog by id, blog not found', async () => {
      await blogTestManager.updateBlog(
        '66bf39c8f855a5438d02adbf',
        blogUpdateModel,
        adminAuthToken,
        404,
      );
    });
  });

  describe('Create post by blog id', () => {
    it('should create post by blog id', async () => {
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

    it('should not create post by blog id, blog not found', async () => {
      await blogTestManager.createPostByBlogId(
        '66bf39c8f855a5438d02adbf',
        blogPostCreateModel,
        adminAuthToken,
        404,
      );
    });

    it('should not create post by blog id, bad input data', async () => {
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

  describe('Get posts by blog id', () => {
    it('should get posts by blog id without query', async () => {
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

    it('should get posts by blog id with pagination, page size: 11', async () => {
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

    it('should get posts by blog id with pagination, page number: 2', async () => {
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

    it('should get empty posts array by blog id', async () => {
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

    it('should get posts by blog id with sorting by name, asc', async () => {
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
});
