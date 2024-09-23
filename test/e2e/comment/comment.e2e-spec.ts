import { ITestSettings } from '../../settings/interfaces';
import {
  ICommentCreateModel,
  ICommentUpdateModel,
} from '../../models/comments/interfaces';
import { initSettings } from '../../settings/test-settings';
import { CommentTestManager } from '../../utils/request-test-manager/comment-test-manager';
import {
  IUserCreateTestModel,
  IUserLoginTestModel,
} from '../../models/user/interfaces';
import { APIErrorsMessageType } from '../../../src/base/types/types';
import { ILikeUpdateModel } from '../../models/like/interfaces';
import { APISettings } from '../../../src/settings/api-settings';
import { UserTestManager } from '../../utils/request-test-manager/user-test-manager';
import { BlogTestManager } from '../../utils/request-test-manager/blog-test-manager';
import { IBlogCreateModel } from '../../models/blog/interfaces';
import { IPostCreateModel } from '../../models/post/interfaces';
import { PostTestManager } from '../../utils/request-test-manager/post-test-manager';
import { CommentOutputModel } from '../../../src/features/blog-platform/comment/api/model/output/comment-output.model';
import { LikeStatusEnum } from '../../../src/features/blog-platform/like/domain/type';

describe('Comment e2e', () => {
  let commentTestManager: CommentTestManager;
  let testSettings: ITestSettings;
  let commentUpdateModel: ICommentUpdateModel;
  let userLoginModel: IUserLoginTestModel;
  let apiSettings: APISettings;
  let userCreateModel: IUserCreateTestModel;
  let login: string;
  let password: string;
  let adminAuthToken: string;
  let likeUpdateModel: ILikeUpdateModel;
  let userTestManager: UserTestManager;
  let blogTestManager: BlogTestManager;
  let blogCreateModel: IBlogCreateModel;
  let postCreateModel: IPostCreateModel;
  let postTestManager: PostTestManager;
  let commentCreateModel: ICommentCreateModel;

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
    commentTestManager = testSettings.testManager.commentTestManager;
    commentUpdateModel =
      testSettings.testModels.commentsTestModel.getCommentUpdateModel();
    userLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
    likeUpdateModel =
      testSettings.testModels.likeTestModel.getLikeUpdateModel();
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
    userTestManager = testSettings.testManager.userTestManager;
    blogTestManager = testSettings.testManager.blogTestManager;
    blogCreateModel =
      testSettings.testModels.blogTestModel.getBlogCreateModel();
    postCreateModel =
      testSettings.testModels.postTestModel.getPostCreateModel();
    commentCreateModel =
      testSettings.testModels.commentsTestModel.getCommentCreateModel();
  });

  describe('Get comment', () => {
    it('should get comment by id', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      const result: CommentOutputModel = await commentTestManager.getComment(
        commentId,
        200,
      );

      expect(result).toEqual({
        id: expect.any(String),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId,
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

    it('should not get comment by id, comment not found', async () => {
      await commentTestManager.getComment('66bf39c8f855a5438d02adbf', 404);
    });
  });

  describe('Update comment', () => {
    it('should update comment by id', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await commentTestManager.updateCommentById(
        commentId.toString(),
        commentUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getComment: CommentOutputModel =
        await commentTestManager.getComment(commentId, 200);
      expect(getComment.content).not.toBe(commentCreateModel.content);
    });

    it('should not update comment by id, bad input model', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      const result1: APIErrorsMessageType =
        await commentTestManager.updateCommentById(
          commentId,
          { content: 'cone' },
          `Bearer ${accessToken}`,
          400,
        );
      expect(result1).toEqual({
        errorsMessages: [
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });

      const result2: APIErrorsMessageType =
        await commentTestManager.updateCommentById(
          commentId,
          { content: '' },
          `Bearer ${accessToken}`,
          400,
        );

      expect(result2).toEqual({
        errorsMessages: [
          {
            field: 'content',
            message: expect.any(String),
          },
        ],
      });

      const getComment: CommentOutputModel =
        await commentTestManager.getComment(commentId, 200);
      expect(getComment.content).toBe(commentCreateModel.content);
    });

    it('should not update comment by id, unauthorized', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await commentTestManager.updateCommentById(
        commentId,
        { content: 'cone' },
        `Bearer accessToken`,
        401,
      );
    });

    it('should not update comment by id, forbidden', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await userTestManager.createUser(
        { ...userCreateModel, login: 'login22', email: 'ee@mail.ru' },
        adminAuthToken,
        201,
      );
      const { accessToken: accessToken2 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login22' },
          200,
        );

      await commentTestManager.updateCommentById(
        commentId,
        commentUpdateModel,
        `Bearer ${accessToken2}`,
        403,
      );
    });

    it('should not update comment by id, comment not found', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await commentTestManager.deleteCommentById(
        commentId,
        `Bearer ${accessToken}`,
        204,
      );

      await commentTestManager.updateCommentById(
        commentId,
        commentUpdateModel,
        `Bearer ${accessToken}`,
        404,
      );
    });
  });

  describe('Delete comment', () => {
    it('should delete comment by id', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await commentTestManager.deleteCommentById(
        commentId,
        `Bearer ${accessToken}`,
        204,
      );
    });

    it('should not delete comment by id, unauthorized', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await commentTestManager.deleteCommentById(
        commentId,
        `Bearer accessToken`,
        401,
      );
    });

    it('should not delete comment by id, forbidden', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await userTestManager.createUser(
        { ...userCreateModel, login: 'login22', email: 'eek@mail.ru' },
        adminAuthToken,
        201,
      );
      const { accessToken: accessToken2 } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login22' },
          200,
        );

      await commentTestManager.deleteCommentById(
        commentId,
        `Bearer ${accessToken2}`,
        403,
      );
    });

    it('should not delete comment by id, comment not found', async () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await commentTestManager.deleteCommentById(
        commentId,
        `Bearer ${accessToken}`,
        204,
      );

      await commentTestManager.deleteCommentById(
        commentId,
        `Bearer ${accessToken}`,
        404,
      );
    });
  });

  describe('Update like status for comment by comment id', () => {
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getComment =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment).toEqual({
        id: commentId,
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
        createdAt: expect.any(String),
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getComment =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment).toEqual({
        id: commentId.toString(),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
        createdAt: expect.any(String),
      });

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getComment2 =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment2).toEqual({
        id: commentId.toString(),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
        createdAt: expect.any(String),
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getComment =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment).toEqual({
        id: commentId.toString(),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
        createdAt: expect.any(String),
      });

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken}`,
        204,
      );

      const getComment2 =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment2).toEqual({
        id: commentId.toString(),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: 'Dislike',
        },
        createdAt: expect.any(String),
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

      const { id: commentId } = await postTestManager.createCommentByPostId(
        postId,
        commentCreateModel,
        `Bearer ${accessToken}`,
        201,
      );

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        likeUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );

      const getComment =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment).toEqual({
        id: commentId.toString(),
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
        createdAt: expect.any(String),
      });

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        { likeStatus: 'Dislike' as LikeStatusEnum },
        `Bearer ${accessToken}`,
        204,
      );

      const getComment2 =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment2).toEqual({
        id: commentId,
        content: commentCreateModel.content,
        commentatorInfo: {
          userId: userId.toString(),
          userLogin: userCreateModel.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: 'Dislike',
        },
        createdAt: expect.any(String),
      });

      await testSettings.testManager.commentTestManager.updateCommentLikeStatusByPostId(
        commentId,
        { likeStatus: 'None' as LikeStatusEnum },
        `Bearer ${accessToken}`,
        204,
      );

      const getComment3 =
        await testSettings.testManager.commentTestManager.getComment(
          commentId,
          200,
          `Bearer ${accessToken}`,
        );

      expect(getComment3).toEqual({
        id: commentId.toString(),
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
  });
});
