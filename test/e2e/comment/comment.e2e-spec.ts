import { ITestSettings } from '../../settings/interfaces';
import { ICommentInsertModel } from '../../models/comments/interfaces';
import { initSettings } from '../../settings/test-settings';
import { CommentTestManager } from '../../utils/request-test-manager/comment-test-manager';
import { CommentOutputModel } from '../../../src/features/comment/api/model/output/comment-output.model';

describe('Comment e2e', () => {
  let commentTestManager: CommentTestManager;
  let testSettings: ITestSettings;
  let commentInsertModel: ICommentInsertModel;

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
});
