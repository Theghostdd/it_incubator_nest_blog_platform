import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import { APIErrorsMessageType } from '../../../src/base/types/types';
import {
  IPostCreateModel,
  IPostInsertModel,
  IPostUpdateModel,
} from '../../models/post/interfaces';
import { PostOutputModel } from '../../../src/features/post/api/models/output/post-output.model';
import { PostTestManager } from '../../utils/request-test-manager/post-test-manager';
import { IBlogInsertModel } from '../../models/blog/interfaces';
import { BasePagination } from '../../../src/base/pagination/base-pagination';
import { BaseSorting } from '../../../src/base/sorting/base-sorting';
import { CommentOutputModel } from '../../../src/features/comment/api/model/output/comment-output.model';
import { ICommentInsertModel } from '../../models/comments/interfaces';

describe('Post e2e', () => {
  let postTestManager: PostTestManager;
  let testSettings: ITestSettings;
  let postCreateModel: IPostCreateModel;
  let postInsertModel: IPostInsertModel;
  let postUpdateModel: IPostUpdateModel;
  let postInsertModels: IPostInsertModel[];
  let blogInsertModel: IBlogInsertModel;
  let commentInsertManyModel: ICommentInsertModel[];

  beforeAll(async () => {
    testSettings = await initSettings();
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    postTestManager = testSettings.testManager.postTestManager;
    postCreateModel =
      testSettings.testModels.postTestModel.getPostCreateModel();
    postInsertModel =
      testSettings.testModels.postTestModel.getPostInsertModel();
    postUpdateModel =
      testSettings.testModels.postTestModel.getPostUpdateModel();
    blogInsertModel =
      testSettings.testModels.blogTestModel.getBlogInsertModel();
    postInsertModels =
      testSettings.testModels.postTestModel.getPostInsertModels();
    commentInsertManyModel =
      testSettings.testModels.commentsTestModel.getCommentInsertManyModel();
  });

  describe('Get posts', () => {
    it('should get posts without query', async () => {
      await testSettings.dataBase.dbInsertMany('posts', postInsertModels);

      const result: BasePagination<PostOutputModel[] | []> =
        await postTestManager.getPosts({}, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: postInsertModels.length,
        items: expect.any(Array),
      });
    });

    it('should get posts with pagination, page size: 11', async () => {
      await testSettings.dataBase.dbInsertMany('posts', postInsertModels);

      const result: BasePagination<PostOutputModel[] | []> =
        await postTestManager.getPosts(
          {
            pageSize: 11,
          } as BaseSorting,
          200,
        );

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 11,
        totalCount: postInsertModels.length,
        items: expect.any(Array),
      });
    });

    it('should get posts with pagination, page number: 2', async () => {
      await testSettings.dataBase.dbInsertMany('posts', postInsertModels);

      const result: BasePagination<PostOutputModel[] | []> =
        await postTestManager.getPosts(
          {
            pageNumber: 2,
          } as BaseSorting,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 10,
        totalCount: postInsertModels.length,
        items: expect.any(Array),
      });
    });

    it('should get empty posts array', async () => {
      const result: BasePagination<PostOutputModel[] | []> =
        await postTestManager.getPosts({}, 200);

      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: expect.any(Array),
      });

      expect(result.items).toHaveLength(0);
    });

    it('should get posts with sorting by name, asc', async () => {
      await testSettings.dataBase.dbInsertMany('posts', postInsertModels);

      const result: BasePagination<PostOutputModel[] | []> =
        await postTestManager.getPosts(
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

      const mapInsertModelAndSortByAsc = postInsertModels
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

  describe('Get post', () => {
    it('should get post by id', async () => {
      const { insertedId: postId } = await testSettings.dataBase.dbInsertOne(
        'posts',
        postInsertModel,
      );

      const result: PostOutputModel = await postTestManager.getPost(
        postId.toString(),
        200,
      );

      expect(result).toEqual({
        id: expect.any(String),
        title: postInsertModel.title,
        shortDescription: postInsertModel.shortDescription,
        content: postInsertModel.content,
        blogId: postInsertModel.blogId,
        blogName: postInsertModel.blogName,
        createdAt: postInsertModel.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('should not get post by id, post not found', async () => {
      await postTestManager.getPost('66bf39c8f855a5438d02adbf', 404);
    });
  });

  describe('Create post', () => {
    it('should create post by blog id', async () => {
      const { insertedId: blogId } = await testSettings.dataBase.dbInsertOne(
        'blogs',
        blogInsertModel,
      );
      const result: PostOutputModel = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId.toString() },
        201,
      );

      expect(result).toEqual({
        id: expect.any(String),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId.toString(),
        blogName: blogInsertModel.name,
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
      await postTestManager.createPost(
        { ...postCreateModel, blogId: '66bf39c8f855a5438d02adbf' },
        404,
      );
    });

    it('should not create post, bad input data', async () => {
      const result: APIErrorsMessageType = await postTestManager.createPost(
        { title: '', shortDescription: '', content: '', blogId: '' },
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
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });

      const withTitle: APIErrorsMessageType = await postTestManager.createPost(
        {
          title: '',
          shortDescription: 'shortDescription',
          content: 'content',
          blogId: '66bf39c8f855a5438d02adbf',
        },
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
        await postTestManager.createPost(
          {
            title: 'title',
            shortDescription: '',
            content: 'content',
            blogId: '66bf39c8f855a5438d02adbf',
          },
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
        await postTestManager.createPost(
          {
            title: 'title',
            shortDescription: 'shortDescription',
            content: '',
            blogId: '66bf39c8f855a5438d02adbf',
          },
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

      const withBlogId: APIErrorsMessageType = await postTestManager.createPost(
        {
          title: 'title',
          shortDescription: 'shortDescription',
          content: 'content',
          blogId: '',
        },
        400,
      );
      expect(withBlogId).toEqual({
        errorsMessages: [
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });
    });
  });

  describe('Delete post', () => {
    it('should delete post by id', async () => {
      const { insertedId: blogId } = await testSettings.dataBase.dbInsertOne(
        'blogs',
        blogInsertModel,
      );
      const { insertedId: postId } = await testSettings.dataBase.dbInsertOne(
        'posts',
        { ...postInsertModel, blogId: blogId.toString() },
      );

      await postTestManager.deletePost(postId.toString(), 204);
      await postTestManager.getPost(postId.toString(), 404);
    });

    it('should not delete post by id, post not found', async () => {
      await postTestManager.deletePost('66bf39c8f855a5438d02adbf', 404);
    });
  });

  describe('Update post', () => {
    it('should update post by id', async () => {
      const { insertedId: blogId } = await testSettings.dataBase.dbInsertOne(
        'blogs',
        blogInsertModel,
      );
      const { insertedId: postId } = await testSettings.dataBase.dbInsertOne(
        'posts',
        { ...postInsertModel, blogId: blogId.toString() },
      );

      await postTestManager.updatePost(
        postId.toString(),
        { ...postUpdateModel, blogId: blogId.toString() },
        204,
      );

      const result: PostOutputModel = await postTestManager.getPost(
        postId.toString(),
        200,
      );
      expect(result.title).not.toBe(postInsertModel.title);
      expect(result.content).not.toBe(postInsertModel.content);
      expect(result.shortDescription).not.toBe(
        postInsertModel.shortDescription,
      );
    });

    it('should not update post, bad input data', async () => {
      const { insertedId: blogId } = await testSettings.dataBase.dbInsertOne(
        'blogs',
        blogInsertModel,
      );
      const { insertedId: postId } = await testSettings.dataBase.dbInsertOne(
        'posts',
        {
          ...postInsertModel,
          blogId: blogId.toString(),
        },
      );

      const result: APIErrorsMessageType = await postTestManager.updatePost(
        blogId.toString(),
        { title: '', shortDescription: '', content: '', blogId: '' },
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
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });

      const withTitle: APIErrorsMessageType = await postTestManager.updatePost(
        blogId.toString(),
        {
          title: '',
          shortDescription: 'shortDescription',
          content: 'content',
          blogId: '66bf39c8f855a5438d02adbf',
        },
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
        await postTestManager.updatePost(
          blogId.toString(),
          {
            title: 'title',
            shortDescription: '',
            content: 'content',
            blogId: '66bf39c8f855a5438d02adbf',
          },
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
        await postTestManager.updatePost(
          blogId.toString(),
          {
            title: 'title',
            shortDescription: 'shortDescription',
            content: '',
            blogId: '66bf39c8f855a5438d02adbf',
          },
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

      const withBlogId: APIErrorsMessageType = await postTestManager.updatePost(
        blogId.toString(),
        {
          title: 'title',
          shortDescription: 'shortDescription',
          content: 'content',
          blogId: '',
        },
        400,
      );
      expect(withBlogId).toEqual({
        errorsMessages: [
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });

      const post: PostOutputModel = await postTestManager.getPost(
        postId.toString(),
        200,
      );
      expect(post.title).toBe(postInsertModel.title);
      expect(post.shortDescription).toBe(postInsertModel.shortDescription);
      expect(post.content).toBe(postInsertModel.content);
    });

    it('should not update post by id, post not found', async () => {
      await postTestManager.updatePost(
        '66bf39c8f855a5438d02adbf',
        { ...postUpdateModel, blogId: '66bf39c8f855a5438d02adbf' },
        404,
      );
    });
  });

  describe('Get comments by post id', () => {
    it('should get comments by post id without query', async () => {
      await testSettings.dataBase.dbInsertMany(
        'comments',
        commentInsertManyModel,
      );

      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          commentInsertManyModel[1].postInfo.postId,
          {},
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: commentInsertManyModel.length,
        items: expect.any(Array),
      });
    });

    it('should get comments by post id with pagination, page size: 11', async () => {
      await testSettings.dataBase.dbInsertMany(
        'comments',
        commentInsertManyModel,
      );

      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          commentInsertManyModel[0].postInfo.postId,
          {
            pageSize: 11,
          } as BaseSorting,
          200,
        );

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 11,
        totalCount: commentInsertManyModel.length,
        items: expect.any(Array),
      });
    });

    it('should get comments by post id with pagination, page number: 2', async () => {
      await testSettings.dataBase.dbInsertMany(
        'comments',
        commentInsertManyModel,
      );
      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          commentInsertManyModel[0].postInfo.postId,
          {
            pageNumber: 2,
          } as BaseSorting,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 10,
        totalCount: commentInsertManyModel.length,
        items: expect.any(Array),
      });
    });

    it('should get empty comments array by post id', async () => {
      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          '66c5d451de17090f93186261',
          {},
          200,
        );

      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: expect.any(Array),
      });

      expect(result.items).toHaveLength(0);
    });

    it('should get comments by post id with sorting by content, asc', async () => {
      await testSettings.dataBase.dbInsertMany(
        'comments',
        commentInsertManyModel,
      );

      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          commentInsertManyModel[0].postInfo.postId,
          {
            sortBy: 'content',
            sortDirection: 'asc',
            pageSize: 20,
          } as BaseSorting,
          200,
        );

      const mapResult = result.items.map((item) => {
        return {
          content: item.content,
        };
      });

      const mapInsertModelAndSortByAsc = commentInsertManyModel
        .map((item) => {
          return {
            content: item.content,
          };
        })
        .sort((a, b) => a.content.localeCompare(b.content));

      expect(mapResult).toEqual(mapInsertModelAndSortByAsc);
    });
  });
});
