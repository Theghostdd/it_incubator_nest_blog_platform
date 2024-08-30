import { ITestSettings } from '../../settings/interfaces';
import {
  ICommentInsertModel,
  ICommentUpdateModel,
} from '../../models/comments/interfaces';
import { initSettings } from '../../settings/test-settings';
import { CommentTestManager } from '../../utils/request-test-manager/comment-test-manager';
import { CommentOutputModel } from '../../../src/features/comment/api/model/output/comment-output.model';
import {
  IUserInsertTestModel,
  IUserLoginTestModel,
} from '../../models/user/interfaces';
import { APIErrorsMessageType } from '../../../src/base/types/types';

describe('Comment e2e', () => {
  let commentTestManager: CommentTestManager;
  let testSettings: ITestSettings;
  let commentInsertModel: ICommentInsertModel;
  let commentUpdateModel: ICommentUpdateModel;
  let userInsertModel: IUserInsertTestModel;
  let userLoginModel: IUserLoginTestModel;
  beforeAll(async () => {
    testSettings = await initSettings();
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    commentInsertModel =
      testSettings.testModels.commentsTestModel.getCommentInsertModel();
    commentTestManager = testSettings.testManager.commentTestManager;
    commentUpdateModel =
      testSettings.testModels.commentsTestModel.getCommentUpdateModel();
    userInsertModel =
      testSettings.testModels.userTestModel.getUserInsertModel();
    userLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();

    commentInsertModel.postInfo = {
      ...commentInsertModel.postInfo,
      postId: '64f2023fa7c8bfa62d7c8c77',
    };
    commentInsertModel.blogInfo = {
      ...commentInsertModel.blogInfo,
      blogId: '64f2023fa7c8bfa62d7c8c77',
    };
  });

  describe('Get comment', () => {
    it('should get comment by id', async () => {
      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        commentInsertModel,
      );

      const result: CommentOutputModel = await commentTestManager.getComment(
        commentId.toString(),
        200,
      );

      expect(result).toEqual({
        id: expect.any(String),
        content: commentInsertModel.content,
        commentatorInfo: {
          userId: commentInsertModel.commentatorInfo.userId,
          userLogin: commentInsertModel.commentatorInfo.userLogin,
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
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await commentTestManager.updateCommentById(
        commentId.toString(),
        commentUpdateModel,
        `Bearer ${accessToken}`,
        204,
      );
    });

    it('should not update comment by id, bad input model', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      const result1: APIErrorsMessageType =
        await commentTestManager.updateCommentById(
          commentId.toString(),
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
          commentId.toString(),
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
    });

    it('should not update comment by id, unauthorized', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      await commentTestManager.updateCommentById(
        commentId.toString(),
        { content: 'cone' },
        `Bearer accessToken`,
        401,
      );
    });

    it('should not update comment by id, forbidden', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      await testSettings.dataBase.dbInsertOne('users', {
        ...userInsertModel,
        _id: '66d1fdd43170eab4af6c4ba3',
        login: 'login2',
        email: 'eamil2@mail.ru',
      });

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login2' },
          200,
        );

      await commentTestManager.updateCommentById(
        commentId.toString(),
        commentUpdateModel,
        `Bearer ${accessToken}`,
        403,
      );
    });

    it('should not update comment by id, comment not found', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await testSettings.dataBase.clearDatabase();

      await commentTestManager.updateCommentById(
        commentId.toString(),
        commentUpdateModel,
        `Bearer ${accessToken}`,
        404,
      );
    });
  });

  describe('Delete comment', () => {
    it('should delete comment by id', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await commentTestManager.deleteCommentById(
        commentId.toString(),
        `Bearer ${accessToken}`,
        204,
      );
    });

    it('should not delete comment by id, unauthorized', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      await commentTestManager.deleteCommentById(
        commentId.toString(),
        `Bearer accessToken`,
        401,
      );
    });

    it('should not delete comment by id, forbidden', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      await testSettings.dataBase.dbInsertOne('users', {
        ...userInsertModel,
        _id: '66d1fdd43170eab4af6c4ba3',
        login: 'login2',
        email: 'eamil2@mail.ru',
      });

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          { ...userLoginModel, loginOrEmail: 'login2' },
          200,
        );

      await commentTestManager.deleteCommentById(
        commentId.toString(),
        `Bearer ${accessToken}`,
        403,
      );
    });

    it('should not delete comment by id, comment not found', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const { insertedId: commentId } = await testSettings.dataBase.dbInsertOne(
        'comments',
        {
          ...commentInsertModel,
          commentatorInfo: {
            ...commentInsertModel.commentatorInfo,
            userId: userId.toString(),
          },
        },
      );

      const { accessToken } =
        await testSettings.testManager.authTestManager.login(
          userLoginModel,
          200,
        );

      await testSettings.dataBase.clearDatabase();

      await commentTestManager.deleteCommentById(
        commentId.toString(),
        `Bearer ${accessToken}`,
        404,
      );
    });
  });
});
