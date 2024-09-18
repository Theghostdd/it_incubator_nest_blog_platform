import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import { APIErrorsMessageType } from '../../../src/base/types/types';
import {
  IPostCreateModel,
  IPostUpdateModel,
} from '../../models/post/interfaces';
import { PostOutputModel } from '../../../src/features/blog-platform/post/api/models/output/post-output.model';
import { PostTestManager } from '../../utils/request-test-manager/post-test-manager';
import { BasePagination } from '../../../src/base/pagination/base-pagination';
import { BaseSorting } from '../../../src/base/sorting/base-sorting';
import { CommentOutputModel } from '../../../src/features/blog-platform/comment/api/model/output/comment-output.model';
import { ICommentCreateModel } from '../../models/comments/interfaces';
import { APISettings } from '../../../src/settings/api-settings';
import {
  IUserCreateTestModel,
  IUserLoginTestModel,
} from '../../models/user/interfaces';
import { ILikeUpdateModel } from '../../models/like/interfaces';
import { LikeStatusEnum } from '../../../src/features/blog-platform/like/domain/type';
import { UserTestManager } from '../../utils/request-test-manager/user-test-manager';
import { BlogTestManager } from '../../utils/request-test-manager/blog-test-manager';
import { IBlogCreateModel } from '../../models/blog/interfaces';

describe('Post e2e', () => {
  let postTestManager: PostTestManager;
  let testSettings: ITestSettings;
  let postCreateModel: IPostCreateModel;
  let postUpdateModel: IPostUpdateModel;
  let commentCreateModel: ICommentCreateModel;
  let userCreateModel: IUserCreateTestModel;
  let userLoginModel: IUserLoginTestModel;
  let apiSettings: APISettings;
  let login: string;
  let password: string;
  let adminAuthToken: string;
  let likeUpdateModel: ILikeUpdateModel;
  let userTestManager: UserTestManager;
  let blogTestManager: BlogTestManager;
  let blogCreateModel: IBlogCreateModel;

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
    // await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    postTestManager = testSettings.testManager.postTestManager;
    postCreateModel =
      testSettings.testModels.postTestModel.getPostCreateModel();
    postUpdateModel =
      testSettings.testModels.postTestModel.getPostUpdateModel();
    commentCreateModel =
      testSettings.testModels.commentsTestModel.getCommentCreateModel();
    userLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
    likeUpdateModel =
      testSettings.testModels.likeTestModel.getLikeUpdateModel();
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
    userTestManager = testSettings.testManager.userTestManager;
    blogTestManager = testSettings.testManager.blogTestManager;
    blogCreateModel =
      testSettings.testModels.blogTestModel.getBlogCreateModel();
  });

  describe('Get posts', () => {
    it('should get posts without query', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      for (let i = 0; i < 11; i++) {
        await postTestManager.createPost(
          { ...postCreateModel, blogId: blogId },
          adminAuthToken,
          201,
        );
      }

      const result: BasePagination<PostOutputModel[] | []> =
        await postTestManager.getPosts({}, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get posts with pagination, page size: 11', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      for (let i = 0; i < 11; i++) {
        await postTestManager.createPost(
          { ...postCreateModel, blogId: blogId },
          adminAuthToken,
          201,
        );
      }

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
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get posts with pagination, page number: 2', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      for (let i = 0; i < 11; i++) {
        await postTestManager.createPost(
          { ...postCreateModel, blogId: blogId },
          adminAuthToken,
          201,
        );
      }

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
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get empty posts array', async () => {
      const result: BasePagination<PostOutputModel[] | []> =
        await postTestManager.getPosts({}, 200);

      expect(result.items).toHaveLength(0);
      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should get posts with sorting by title, asc', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const createdPostsArray = [];
      for (let i = 0; i < 11; i++) {
        await postTestManager.createPost(
          {
            ...postCreateModel,
            title: 'THIS IS POST' + (i - 1),
            blogId: blogId,
          },
          adminAuthToken,
          201,
        );
        createdPostsArray.push({
          ...postCreateModel,
          title: 'THIS IS POST' + (i - 1),
          blogId: blogId,
        });
      }

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

    it('should get posts with last likes array, with 2 users and 2 like and 2 dislike', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId1 } =
        await testSettings.testManager.postTestManager.createPost(
          { ...postCreateModel, blogId: blogId },
          adminAuthToken,
          201,
        );
      const { id: postId2 } =
        await testSettings.testManager.postTestManager.createPost(
          { ...postCreateModel, blogId: blogId },
          adminAuthToken,
          201,
        );

      const { id: userId1 } =
        await testSettings.testManager.userTestManager.createUser(
          userCreateModel,
          adminAuthToken,
          201,
        );
      const { id: userId2 } =
        await testSettings.testManager.userTestManager.createUser(
          { ...userCreateModel, login: 'login2', email: 'email2@mail.ru' },
          adminAuthToken,
          201,
        );
      const { id: userId3 } =
        await testSettings.testManager.userTestManager.createUser(
          { ...userCreateModel, login: 'login3', email: 'email3@mail.ru' },
          adminAuthToken,
          201,
        );
      const { id: userId4 } =
        await testSettings.testManager.userTestManager.createUser(
          { ...userCreateModel, login: 'login4', email: 'email4@mail.ru' },
          adminAuthToken,
          201,
        );

      const { accessToken: accessToken1 } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );
      const { accessToken: accessToken2 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login2' },
          200,
        );
      const { accessToken: accessToken3 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login3' },
          200,
        );
      const { accessToken: accessToken4 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login4' },
          200,
        );

      await postTestManager.updatePostLikeStatusByPostId(
        postId1,
        likeUpdateModel,
        `Bearer ${accessToken1}`,
        204,
      );
      await postTestManager.updatePostLikeStatusByPostId(
        postId1,
        likeUpdateModel,
        `Bearer ${accessToken2}`,
        204,
      );
      await postTestManager.updatePostLikeStatusByPostId(
        postId1,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken3}`,
        204,
      );
      await postTestManager.updatePostLikeStatusByPostId(
        postId1,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken4}`,
        204,
      );
      await postTestManager.updatePostLikeStatusByPostId(
        postId2,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken1}`,
        204,
      );
      await postTestManager.updatePostLikeStatusByPostId(
        postId2,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken2}`,
        204,
      );
      await postTestManager.updatePostLikeStatusByPostId(
        postId2,
        likeUpdateModel,
        `Bearer ${accessToken3}`,
        204,
      );
      await postTestManager.updatePostLikeStatusByPostId(
        postId2,
        likeUpdateModel,
        `Bearer ${accessToken4}`,
        204,
      );

      const getPosts: BasePagination<PostOutputModel[] | []> =
        await testSettings.testManager.postTestManager.getPosts(
          {},
          200,
          `Bearer ${accessToken4}`,
        );

      expect(getPosts.items[0].extendedLikesInfo).toEqual({
        likesCount: 2,
        dislikesCount: 2,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: userId4,
            login: 'login4',
          },
          {
            addedAt: expect.any(String),
            userId: userId3,
            login: 'login3',
          },
        ],
      });

      expect(getPosts.items[1].extendedLikesInfo).toEqual({
        likesCount: 2,
        dislikesCount: 2,
        myStatus: 'Dislike',
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: userId2,
            login: 'login2',
          },
          {
            addedAt: expect.any(String),
            userId: userId1,
            login: userLoginModel.loginOrEmail,
          },
        ],
      });
    });
  });

  describe('Get post', () => {
    it('should get post by id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const result: PostOutputModel = await postTestManager.getPost(
        postId,
        200,
      );

      expect(result).toEqual({
        id: expect.any(String),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
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

    it('should not get post by id, post not found', async () => {
      await postTestManager.getPost('66bf39c8f855a5438d02adbf', 404);
    });

    it('should get post with last likes array, with 2 users and 2 like and 2 dislike', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } =
        await testSettings.testManager.postTestManager.createPost(
          { ...postCreateModel, blogId: blogId },
          adminAuthToken,
          201,
        );

      const { id: userId1 } =
        await testSettings.testManager.userTestManager.createUser(
          userCreateModel,
          adminAuthToken,
          201,
        );
      const { id: userId2 } =
        await testSettings.testManager.userTestManager.createUser(
          { ...userCreateModel, login: 'login2', email: 'email2@mail.ru' },
          adminAuthToken,
          201,
        );
      await testSettings.testManager.userTestManager.createUser(
        { ...userCreateModel, login: 'login3', email: 'email3@mail.ru' },
        adminAuthToken,
        201,
      );
      await testSettings.testManager.userTestManager.createUser(
        { ...userCreateModel, login: 'login4', email: 'email4@mail.ru' },
        adminAuthToken,
        201,
      );

      const { accessToken: accessToken1 } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      const { accessToken: accessToken2 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login2' },
          200,
        );
      const { accessToken: accessToken3 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login3' },
          200,
        );
      const { accessToken: accessToken4 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login4' },
          200,
        );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        likeUpdateModel,
        `Bearer ${accessToken1}`,
        204,
      );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        likeUpdateModel,
        `Bearer ${accessToken2}`,
        204,
      );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken3}`,
        204,
      );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken4}`,
        204,
      );

      const getPost = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken1}`,
      );
      expect(getPost.extendedLikesInfo).toEqual({
        likesCount: 2,
        dislikesCount: 2,
        myStatus: LikeStatusEnum.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: userId2,
            login: 'login2',
          },
          {
            addedAt: expect.any(String),
            userId: userId1,
            login: userCreateModel.login,
          },
        ],
      });

      const getPost2 = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken3}`,
      );
      expect(getPost2.extendedLikesInfo).toEqual({
        likesCount: 2,
        dislikesCount: 2,
        myStatus: LikeStatusEnum.Dislike,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: userId2,
            login: 'login2',
          },
          {
            addedAt: expect.any(String),
            userId: userId1,
            login: userCreateModel.login,
          },
        ],
      });

      const withoutToken = await postTestManager.getPost(
        postId.toString(),
        200,
      );
      expect(withoutToken.extendedLikesInfo).toEqual({
        likesCount: 2,
        dislikesCount: 2,
        myStatus: LikeStatusEnum.None,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: userId2,
            login: 'login2',
          },
          {
            addedAt: expect.any(String),
            userId: userId1,
            login: userCreateModel.login,
          },
        ],
      });
    });

    it('should get post with last likes array, with 4 like and need get last likes', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const { id: userId2 } = await userTestManager.createUser(
        { ...userCreateModel, login: 'login2', email: 'email2@mail.ru' },
        adminAuthToken,
        201,
      );
      const { id: userId3 } = await userTestManager.createUser(
        { ...userCreateModel, login: 'login3', email: 'email3@mail.ru' },
        adminAuthToken,
        201,
      );
      const { id: userId4 } = await userTestManager.createUser(
        { ...userCreateModel, login: 'login4', email: 'email4@mail.ru' },
        adminAuthToken,
        201,
      );

      const { accessToken: accessToken1 } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      const { accessToken: accessToken2 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login2' },
          200,
        );
      const { accessToken: accessToken3 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login3' },
          200,
        );
      const { accessToken: accessToken4 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login4' },
          200,
        );

      await postTestManager.updatePostLikeStatusByPostId(
        postId.toString(),
        likeUpdateModel,
        `Bearer ${accessToken1}`,
        204,
      );

      await postTestManager.updatePostLikeStatusByPostId(
        postId.toString(),
        likeUpdateModel,
        `Bearer ${accessToken2}`,
        204,
      );

      await postTestManager.updatePostLikeStatusByPostId(
        postId.toString(),
        likeUpdateModel,
        `Bearer ${accessToken3}`,
        204,
      );

      await postTestManager.updatePostLikeStatusByPostId(
        postId.toString(),
        likeUpdateModel,
        `Bearer ${accessToken4}`,
        204,
      );

      const getPost = await postTestManager.getPost(
        postId.toString(),
        200,
        `Bearer ${accessToken1}`,
      );
      expect(getPost.extendedLikesInfo).toEqual({
        likesCount: 4,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: userId4,
            login: 'login4',
          },
          {
            addedAt: expect.any(String),
            userId: userId3,
            login: 'login3',
          },
          {
            addedAt: expect.any(String),
            userId: userId2,
            login: 'login2',
          },
        ],
      });
    });
  });

  describe('Create post', () => {
    it('should create post by blog id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const result: PostOutputModel = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      expect(result).toEqual({
        id: expect.any(String),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
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
      const result = await postTestManager.createPost(
        { ...postCreateModel, blogId: '66bf39c8f855a5438d02adbf' },
        adminAuthToken,
        400,
      );
      expect(result).toEqual({
        errorsMessages: [
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });
    });

    it('should not create post, bad input data', async () => {
      const result: APIErrorsMessageType = await postTestManager.createPost(
        {
          title: '',
          shortDescription: '',
          content: '',
          blogId: '',
        },
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
          blogId: '66d2278807f033d83e59f5f6',
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
          {
            field: 'blogId',
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
            blogId: '66d2278807f033d83e59f5f6',
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
          {
            field: 'blogId',
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
            blogId: '66d2278807f033d83e59f5f6',
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
          {
            field: 'blogId',
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
        adminAuthToken,
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
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await postTestManager.deletePost(postId, adminAuthToken, 204);
      await postTestManager.getPost(postId, 404);
      await postTestManager.deletePost(postId, adminAuthToken, 404);
    });

    it('should not delete post by id, post not found', async () => {
      await postTestManager.deletePost(
        '66bf39c8f855a5438d02adbf',
        adminAuthToken,
        404,
      );
    });
  });

  describe('Update post', () => {
    it('should update post by id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await postTestManager.updatePost(
        postId,
        { ...postUpdateModel, blogId: blogId },
        adminAuthToken,
        204,
      );

      const result: PostOutputModel = await postTestManager.getPost(
        postId.toString(),
        200,
      );
      expect(result.title).not.toBe(postCreateModel.title);
      expect(result.content).not.toBe(postCreateModel.content);
      expect(result.shortDescription).not.toBe(
        postCreateModel.shortDescription,
      );
    });

    it('should not update post, bad input data', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );

      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const result: APIErrorsMessageType = await postTestManager.updatePost(
        'blogId.toString()',
        { title: '', shortDescription: '', content: '', blogId: '' },
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
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });

      const withTitle: APIErrorsMessageType = await postTestManager.updatePost(
        '66d22840fe8ba2e6f7319152',
        {
          title: '',
          shortDescription: 'shortDescription',
          content: 'content',
          blogId: '66bf39c8f855a5438d02adbf',
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
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });

      const withShortDescription: APIErrorsMessageType =
        await postTestManager.updatePost(
          '66d22840fe8ba2e6f7319152',
          {
            title: 'title',
            shortDescription: '',
            content: 'content',
            blogId: '66bf39c8f855a5438d02adbf',
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
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });

      const withContent: APIErrorsMessageType =
        await postTestManager.updatePost(
          '66bf39c8f855a5438d02adbf',
          {
            title: 'title',
            shortDescription: 'shortDescription',
            content: '',
            blogId: '66bf39c8f855a5438d02adbf',
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
          {
            field: 'blogId',
            message: expect.any(String),
          },
        ],
      });

      const withBlogId: APIErrorsMessageType = await postTestManager.updatePost(
        '66bf39c8f855a5438d02adbf',
        {
          title: 'title',
          shortDescription: 'shortDescription',
          content: 'content',
          blogId: '',
        },
        adminAuthToken,
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
      expect(post.title).toBe(postCreateModel.title);
      expect(post.shortDescription).toBe(postCreateModel.shortDescription);
      expect(post.content).toBe(postCreateModel.content);
    });

    it('should not update post by id, post not found', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      await postTestManager.updatePost(
        '66bf39c8f855a5438d02adbf',
        { ...postUpdateModel, blogId: blogId },
        adminAuthToken,
        404,
      );
    });
  });

  describe('Get comments by post id', () => {
    it('should get comments by post id without query', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      for (let i = 0; i < 11; i++) {
        await postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken}`,
          201,
        );
      }

      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(postId, {}, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get comments by post id with pagination, page size: 11', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      for (let i = 0; i < 11; i++) {
        await postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken}`,
          201,
        );
      }

      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          postId,
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

    it('should get comments by post id with pagination, page number: 2', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      for (let i = 0; i < 11; i++) {
        await postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken}`,
          201,
        );
      }

      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          postId,
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

    it('should not get comments array by post id, 404 not found', async () => {
      await postTestManager.getCommentsByPostId(
        '66c5d451de17090f93186261',
        {},
        404,
      );
    });

    it('should get comments by post id with sorting by content, asc', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      const createdCommentsArray = [];
      for (let i = 0; i < 11; i++) {
        await postTestManager.createCommentByPostId(
          postId,
          { content: 'Content some content some content' + 1 },
          `Bearer ${accessToken}`,
          201,
        );
        createdCommentsArray.push({
          content: 'Content some content some content' + 1,
        });
      }

      const result: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          postId,
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

      const mapInsertModelAndSortByAsc = createdCommentsArray
        .map((item) => {
          return {
            content: item.content,
          };
        })
        .sort((a, b) => a.content.localeCompare(b.content));

      expect(mapResult).toEqual(mapInsertModelAndSortByAsc);
    });

    it('should get comments by post id with user`s like status', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const { id: userId1 } =
        await testSettings.testManager.userTestManager.createUser(
          userCreateModel,
          adminAuthToken,
          201,
        );
      const { id: userId2 } =
        await testSettings.testManager.userTestManager.createUser(
          { ...userCreateModel, login: 'login2', email: 'email2@mail.ru' },
          adminAuthToken,
          201,
        );

      const { accessToken: accessToken1 } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      const { accessToken: accessToken2 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login2' },
          200,
        );

      const { id: commentId1 } =
        await testSettings.testManager.postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken1}`,
          201,
        );
      const { id: commentId2 } =
        await testSettings.testManager.postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken1}`,
          201,
        );
      const { id: commentId3 } =
        await testSettings.testManager.postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken2}`,
          201,
        );
      const { id: commentId4 } =
        await testSettings.testManager.postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken2}`,
          201,
        );

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId1,
        likeUpdateModel,
        `Bearer ${accessToken1}`,
        204,
      );
      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId2,
        likeUpdateModel,
        `Bearer ${accessToken1}`,
        204,
      );
      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId3,
        likeUpdateModel,
        `Bearer ${accessToken2}`,
        204,
      );
      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId4,
        likeUpdateModel,
        `Bearer ${accessToken2}`,
        204,
      );

      const getComments: BasePagination<CommentOutputModel[] | []> =
        await postTestManager.getCommentsByPostId(
          postId,
          {},
          200,
          `Bearer ${accessToken2}`,
        );

      expect(getComments.items).toHaveLength(4);
      expect(getComments.items[0]).toEqual({
        id: expect.any(String),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId2,
          userLogin: 'login2',
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
        createdAt: expect.any(String),
      });

      expect(getComments.items[0]).toEqual({
        id: expect.any(String),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId2,
          userLogin: 'login2',
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
        createdAt: expect.any(String),
      });

      expect(getComments.items[3]).toEqual({
        id: expect.any(String),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId1,
          userLogin: userLoginModel.loginOrEmail,
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'None',
        },
        createdAt: expect.any(String),
      });

      expect(getComments.items[2]).toEqual({
        id: expect.any(String),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId1,
          userLogin: userLoginModel.loginOrEmail,
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'None',
        },
        createdAt: expect.any(String),
      });
    });
  });

  describe('Create comment by post id for special post', () => {
    it('should create comment by post id', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      const result: CommentOutputModel =
        await postTestManager.createCommentByPostId(
          postId,
          commentCreateModel,
          `Bearer ${accessToken}`,
          201,
        );
      expect(result).toEqual({
        id: expect.any(String),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
        createdAt: expect.any(String),
      });
    });

    it('should not create comment by post id, bad input model', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      commentCreateModel.content = '';
      const result: APIErrorsMessageType =
        await postTestManager.createCommentByPostId(
          postId.toString(),
          commentCreateModel,
          `Bearer ${accessToken}`,
          400,
        );
      expect(result).toEqual({
        errorsMessages: [
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });

      commentCreateModel.content = 'short';
      const shortContent: APIErrorsMessageType =
        await postTestManager.createCommentByPostId(
          postId.toString(),
          commentCreateModel,
          `Bearer ${accessToken}`,
          400,
        );
      expect(shortContent).toEqual({
        errorsMessages: [
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });
    });

    it('should not create comment by post id, user not authorized', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer accessToken`,
        401,
      );
    });

    it('should not create comment by post id, post not found', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await postTestManager.createCommentByPostId(
        '66ce23e21b1e6e98e79f9f1d',
        commentCreateModel,
        `Bearer ${accessToken}`,
        404,
      );
    });

    it('should not create comment by post id, user not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await testSettings.dataBase.clearDatabase();

      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      await postTestManager.createCommentByPostId(
        postId.toString(),
        commentCreateModel,
        `Bearer ${accessToken}`,
        404,
      );
    });
  });

  describe('Update like status for post by post id', () => {
    it('should update like status, the status must be "Like"', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getPost = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPost).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId.toString(),
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.Like,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: userId.toString(),
              login: userCreateModel.login,
            },
          ],
        },
      });
    });

    it('should update like status to "Like" and update again with "Like" the status must be "Like"', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getPost = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPost).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId.toString(),
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.Like,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: userId.toString(),
              login: userCreateModel.login,
            },
          ],
        },
      });

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getPostSecond = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPostSecond).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId,
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.Like,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: userId.toString(),
              login: userCreateModel.login,
            },
          ],
        },
      });
    });

    it('should update like status to "Like" and change status to dislike, the status must be "Dislike"', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getPost = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPost).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId,
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.Like,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: userId.toString(),
              login: userCreateModel.login,
            },
          ],
        },
      });

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken}`,
        204,
      );

      const getPostSecond = await postTestManager.getPost(
        postId.toString(),
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPostSecond).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId,
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: LikeStatusEnum.Dislike,
          newestLikes: [],
        },
      });
    });

    it('should update like status to "Like" and change status to dislike, than remove like"', async () => {
      const { id: blogId } = await blogTestManager.createBlog(
        blogCreateModel,
        adminAuthToken,
        201,
      );
      const { id: postId } = await postTestManager.createPost(
        { ...postCreateModel, blogId: blogId },
        adminAuthToken,
        201,
      );

      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getPost = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPost).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId,
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.Like,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: userId.toString(),
              login: userCreateModel.login,
            },
          ],
        },
      });

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken}`,
        204,
      );

      const getPostSecond = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPostSecond).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId,
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: LikeStatusEnum.Dislike,
          newestLikes: [],
        },
      });

      await postTestManager.updatePostLikeStatusByPostId(
        postId,
        { likeStatus: 'None' as LikeStatusEnum },
        `Bearer ${accessToken}`,
        204,
      );

      const getPostThree = await postTestManager.getPost(
        postId,
        200,
        `Bearer ${accessToken}`,
      );

      expect(getPostThree).toEqual({
        id: postId.toString(),
        title: postCreateModel.title,
        shortDescription: postCreateModel.shortDescription,
        content: postCreateModel.content,
        blogId: blogId,
        blogName: blogCreateModel.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.None,
          newestLikes: [],
        },
      });
    });
  });
});
