import { APISettings } from '../../../../src/settings/api-settings';
import { initSettings } from '../../../settings/test-settings';
import { ITestSettings } from '../../../settings/interfaces';
import { QuestionsTestModel } from '../../../models/quiz-game/question/questions.model';
import { QuizGameTestManager } from '../../../utils/request-test-manager/quiz-test-manager';
import {
  QuestionQuery,
  QuestionsInputModel,
  QuestionsPublishInputModel,
  QuestionsUpdateInputModel,
} from '../../../../src/features/quiz-game/questions/api/models/input/questions-input.model';
import { ApiErrorMessageModel } from '../../../../src/base/types/types';
import { QuestionOutputModel } from '../../../../src/features/quiz-game/questions/api/models/output/question-output.model';
import { BasePagination } from '../../../../src/base/pagination/base-pagination';
import { QuizQuestionPublishedPropertyEnum } from '../../../../src/features/quiz-game/questions/domain/types';

describe('Quiz questions e2e', () => {
  let testSettings: ITestSettings;
  let apiSettings: APISettings;
  let login: string;
  let password: string;
  let adminAuthToken: string;
  let questionsTestModel: QuestionsTestModel;
  let quizGameTestManager: QuizGameTestManager;

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
    questionsTestModel = new QuestionsTestModel();
    quizGameTestManager = testSettings.testManager.quizGameTestManager;
  });

  describe('Get questions', () => {
    it('should create question then get all question without pagination', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      for (let i = 0; i < 11; i++) {
        if (i === 3) {
          const body2: QuestionsInputModel = {
            body: 'What is nest JS',
            correctAnswers: ['Framework'],
          };
          await quizGameTestManager.createQuestion(adminAuthToken, body2, 201);
        } else {
          await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
        }
      }
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);

      expect(getQuestion.items).toHaveLength(10);
      expect(getQuestion).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should create question then get all question with pagination, page 2', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      for (let i = 0; i < 11; i++) {
        if (i === 3) {
          const body2: QuestionsInputModel = {
            body: 'What is nest JS',
            correctAnswers: ['Framework'],
          };
          await quizGameTestManager.createQuestion(adminAuthToken, body2, 201);
        } else {
          await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
        }
      }
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(
          adminAuthToken,
          { pageNumber: 2 } as QuestionQuery,
          200,
        );
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should create question then get all question with pagination, only publish questions', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      for (let i = 0; i < 11; i++) {
        if (i === 3) {
          const body2: QuestionsInputModel = {
            body: 'What is nest JS',
            correctAnswers: ['Framework'],
          };
          await quizGameTestManager.createQuestion(adminAuthToken, body2, 201);
        } else {
          const questionResult: QuestionOutputModel =
            await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
          const questionId: string = questionResult.id;
          const publishBody: QuestionsPublishInputModel = {
            published: true,
          };
          await quizGameTestManager.publishQuestionById(
            adminAuthToken,
            questionId,
            publishBody,
            204,
          );
        }
      }
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(
          adminAuthToken,
          {
            publishedStatus: QuizQuestionPublishedPropertyEnum.published,
          } as QuestionQuery,
          200,
        );
      expect(getQuestion.items).toHaveLength(10);
      expect(getQuestion).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 10,
        items: expect.any(Array),
      });
    });

    it('should create question then get all question with pagination, only publish questions and body search', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      for (let i = 0; i < 11; i++) {
        if (i === 3) {
          const body2: QuestionsInputModel = {
            body: 'What is nest JS',
            correctAnswers: ['Framework'],
          };

          const creteResult: QuestionOutputModel =
            await quizGameTestManager.createQuestion(
              adminAuthToken,
              body2,
              201,
            );
          const questionId = creteResult.id;
          const publishBody: QuestionsPublishInputModel = {
            published: true,
          };
          await quizGameTestManager.publishQuestionById(
            adminAuthToken,
            questionId,
            publishBody,
            204,
          );
        } else {
          await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
        }
      }
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(
          adminAuthToken,
          {
            publishedStatus: QuizQuestionPublishedPropertyEnum.published,
            bodySearchTerm: 'nest',
          } as QuestionQuery,
          200,
        );
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: expect.any(Array),
      });
    });

    it('should create question then get all question with pagination, only unpublished questions and page size 11', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      for (let i = 0; i < 11; i++) {
        if (i === 3) {
          const body2: QuestionsInputModel = {
            body: 'What is nest JS',
            correctAnswers: ['Framework'],
          };

          const creteResult: QuestionOutputModel =
            await quizGameTestManager.createQuestion(
              adminAuthToken,
              body2,
              201,
            );
          const questionId = creteResult.id;
          const publishBody: QuestionsPublishInputModel = {
            published: true,
          };
          await quizGameTestManager.publishQuestionById(
            adminAuthToken,
            questionId,
            publishBody,
            204,
          );
        } else {
          await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
        }
      }
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(
          adminAuthToken,
          {
            publishedStatus: QuizQuestionPublishedPropertyEnum.notPublished,
            pageSize: 11,
          } as QuestionQuery,
          200,
        );

      expect(getQuestion.items).toHaveLength(10);
      expect(getQuestion).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 11,
        totalCount: 10,
        items: expect.any(Array),
      });
    });
  });

  describe('Create question', () => {
    it('should create question with correct answers array', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: expect.any(String),
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should not create question, bad input data', async () => {
      const bodyUnCorrect: QuestionsInputModel = {
        body: questionsTestModel.unCorrectBody,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const resultWithBody: ApiErrorMessageModel =
        await quizGameTestManager.createQuestion(
          adminAuthToken,
          bodyUnCorrect,
          400,
        );
      expect(resultWithBody).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });

      const correctAnswerIsNotCorrect: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.unCorrectAnswers,
      };
      const resultWithAnswers: ApiErrorMessageModel =
        await quizGameTestManager.createQuestion(
          adminAuthToken,
          correctAnswerIsNotCorrect,
          400,
        );
      expect(resultWithAnswers).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'correctAnswers',
          },
        ],
      });

      const correctAnswerIsNotCorrectAndBody: QuestionsInputModel = {
        body: questionsTestModel.unCorrectBody,
        correctAnswers: questionsTestModel.unCorrectAnswers,
      };
      const resultWithAnswersAndBody: ApiErrorMessageModel =
        await quizGameTestManager.createQuestion(
          adminAuthToken,
          correctAnswerIsNotCorrectAndBody,
          400,
        );
      expect(resultWithAnswersAndBody).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
          {
            message: expect.any(String),
            field: 'correctAnswers',
          },
        ],
      });

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(0);
    });

    it('should not create question, Unauthorized', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      await quizGameTestManager.createQuestion('adminAuthToken', body, 401);
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
    });
  });

  describe('Delete question', () => {
    it('should create question with correct answers array then delete this question by id', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;
      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: expect.any(String),
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      await quizGameTestManager.deleteQuestion(adminAuthToken, questionId, 204);
      const getQuestionAfterDelete: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterDelete.items).toHaveLength(0);
    });

    it('should create question with correct answers array then should not delete this question by id, Unauthorized', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;
      await quizGameTestManager.deleteQuestion(
        'adminAuthToken',
        questionId,
        401,
      );
      await quizGameTestManager.deleteQuestion(adminAuthToken, questionId, 204);
      const getQuestionAfterDelete: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterDelete.items).toHaveLength(0);
    });

    it('should create question, then should not delete this question by id, question not found', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;
      await quizGameTestManager.deleteQuestion(adminAuthToken, questionId, 204);
      await quizGameTestManager.deleteQuestion(adminAuthToken, questionId, 404);
    });
  });

  describe('Publish question', () => {
    it('should create question, and publish this question', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );
      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question then should not publish this question by id, Unauthorized', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        'adminAuthToken',
        questionId,
        publishBody,
        401,
      );
      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, then should not publish this question by id, question not found', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      await quizGameTestManager.deleteQuestion(adminAuthToken, questionId, 204);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        404,
      );

      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(0);
    });

    it('should create question, and publish this question then unpublish this question', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );
      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const unPublishBody: QuestionsPublishInputModel = {
        published: false,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        unPublishBody,
        204,
      );

      const getQuestionAfterUnPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUnPublish.items).toHaveLength(1);
      expect(getQuestionAfterUnPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, and publish this question then publish again', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );
      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );

      const getQuestionAfterUnPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUnPublish.items).toHaveLength(1);
      expect(getQuestionAfterUnPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, and publish this question then unPublish and unPublish again', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );
      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const unPublishBody: QuestionsPublishInputModel = {
        published: false,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        unPublishBody,
        204,
      );

      const getQuestionAfterUnPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUnPublish.items).toHaveLength(1);
      expect(getQuestionAfterUnPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        unPublishBody,
        204,
      );

      const getQuestionAfterUnPublish2: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUnPublish2.items).toHaveLength(1);
      expect(getQuestionAfterUnPublish2.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, and publish this question with bad input data, error 400', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBodyBad = {
        published: 'true',
      };
      const publish: ApiErrorMessageModel =
        await quizGameTestManager.publishQuestionById(
          adminAuthToken,
          questionId,
          publishBodyBad,
          400,
        );
      expect(publish).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'published',
          },
        ],
      });

      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });
  });

  describe('Update question', () => {
    it('should create question, and update this question', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody: QuestionsUpdateInputModel = {
        body: questionsTestModel.updateBody,
        correctAnswers: questionsTestModel.updateCorrectAnswers,
      };

      await quizGameTestManager.updateQuestionById(
        adminAuthToken,
        questionId,
        updateBody,
        204,
      );

      const getQuestionAfterUpdate: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate.items).toHaveLength(1);
      expect(getQuestionAfterUpdate.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question then should not update this question by id, Unauthorized', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody: QuestionsUpdateInputModel = {
        body: questionsTestModel.updateBody,
        correctAnswers: questionsTestModel.updateCorrectAnswers,
      };

      await quizGameTestManager.updateQuestionById(
        'adminAuthToken',
        questionId,
        updateBody,
        401,
      );

      const getQuestionAfterUpdate: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate.items).toHaveLength(1);
      expect(getQuestionAfterUpdate.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, then should not update this question by id, question not found', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody: QuestionsUpdateInputModel = {
        body: questionsTestModel.updateBody,
        correctAnswers: questionsTestModel.updateCorrectAnswers,
      };
      await quizGameTestManager.updateQuestionById(
        adminAuthToken,
        '1234',
        updateBody,
        404,
      );

      const getQuestionAfterUpdate: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate.items).toHaveLength(1);
      expect(getQuestionAfterUpdate.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, and update this question with bad input data, error 400', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const unCorrectUpdateBody: QuestionsUpdateInputModel = {
        body: questionsTestModel.unCorrectUpdateBody,
        correctAnswers: questionsTestModel.updateCorrectAnswers,
      };

      const updateResultWithBody: ApiErrorMessageModel =
        await quizGameTestManager.updateQuestionById(
          adminAuthToken,
          questionId,
          unCorrectUpdateBody,
          400,
        );
      expect(updateResultWithBody).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });

      const unCorrectUpdateAnswers: QuestionsUpdateInputModel = {
        body: questionsTestModel.updateBody,
        correctAnswers: questionsTestModel.unCorrectUpdateCorrectAnswers,
      };
      const updateResultWithAnswers: ApiErrorMessageModel =
        await quizGameTestManager.updateQuestionById(
          adminAuthToken,
          questionId,
          unCorrectUpdateAnswers,
          400,
        );
      expect(updateResultWithAnswers).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'correctAnswers',
          },
        ],
      });

      const unCorrectUpdateBodyAndAnswers: QuestionsUpdateInputModel = {
        body: questionsTestModel.unCorrectUpdateBody,
        correctAnswers: questionsTestModel.unCorrectUpdateCorrectAnswers,
      };
      const updateResultWithBodyAndAnswers: ApiErrorMessageModel =
        await quizGameTestManager.updateQuestionById(
          adminAuthToken,
          questionId,
          unCorrectUpdateBodyAndAnswers,
          400,
        );
      expect(updateResultWithBodyAndAnswers).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
          {
            message: expect.any(String),
            field: 'correctAnswers',
          },
        ],
      });

      const getQuestionAfterUpdate: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate.items).toHaveLength(1);
      expect(getQuestionAfterUpdate.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, and update this question then publish this question and update the question, bad error, question was publish', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody: QuestionsUpdateInputModel = {
        body: questionsTestModel.updateBody,
        correctAnswers: questionsTestModel.updateCorrectAnswers,
      };

      await quizGameTestManager.updateQuestionById(
        adminAuthToken,
        questionId,
        updateBody,
        204,
      );

      const getQuestionAfterUpdate: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate.items).toHaveLength(1);
      expect(getQuestionAfterUpdate.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );
      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody2: QuestionsUpdateInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const updateResult: ApiErrorMessageModel =
        await quizGameTestManager.updateQuestionById(
          adminAuthToken,
          questionId,
          updateBody2,
          400,
        );

      expect(updateResult).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'published',
          },
        ],
      });

      const getQuestionAfterUpdate2: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate2.items).toHaveLength(1);
      expect(getQuestionAfterUpdate2.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, update this question then publish this question and update the question, bad error, question was publish, and unpublish question then update again and publish', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody: QuestionsUpdateInputModel = {
        body: questionsTestModel.updateBody,
        correctAnswers: questionsTestModel.updateCorrectAnswers,
      };

      await quizGameTestManager.updateQuestionById(
        adminAuthToken,
        questionId,
        updateBody,
        204,
      );

      const getQuestionAfterUpdate: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate.items).toHaveLength(1);
      expect(getQuestionAfterUpdate.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );
      const getQuestionAfterPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish.items).toHaveLength(1);
      expect(getQuestionAfterPublish.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody2: QuestionsUpdateInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };
      const updateResult: ApiErrorMessageModel =
        await quizGameTestManager.updateQuestionById(
          adminAuthToken,
          questionId,
          updateBody2,
          400,
        );

      expect(updateResult).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'published',
          },
        ],
      });

      const getQuestionAfterUpdate2: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate2.items).toHaveLength(1);
      expect(getQuestionAfterUpdate2.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const unPublishBody: QuestionsPublishInputModel = {
        published: false,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        unPublishBody,
        204,
      );

      const getQuestionAfterUnPublish: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUnPublish.items).toHaveLength(1);
      expect(getQuestionAfterUnPublish.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      await quizGameTestManager.updateQuestionById(
        adminAuthToken,
        questionId,
        updateBody2,
        204,
      );

      const getQuestionAfterUpdate3: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate3.items).toHaveLength(1);
      expect(getQuestionAfterUpdate3.items).toEqual([
        {
          id: questionId,
          body: updateBody2.body,
          correctAnswers: updateBody2.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );

      const getQuestionAfterPublish3: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterPublish3.items).toHaveLength(1);
      expect(getQuestionAfterPublish3.items).toEqual([
        {
          id: questionId,
          body: updateBody2.body,
          correctAnswers: updateBody2.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it('should create question, and update this question then publish and delete the question', async () => {
      const body: QuestionsInputModel = {
        body: questionsTestModel.body,
        correctAnswers: questionsTestModel.correctAnswers,
      };

      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;

      const getQuestion: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestion.items).toHaveLength(1);
      expect(getQuestion.items).toEqual([
        {
          id: questionId,
          body: body.body,
          correctAnswers: body.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const updateBody: QuestionsUpdateInputModel = {
        body: questionsTestModel.updateBody,
        correctAnswers: questionsTestModel.updateCorrectAnswers,
      };

      await quizGameTestManager.updateQuestionById(
        adminAuthToken,
        questionId,
        updateBody,
        204,
      );

      const getQuestionAfterUpdate: BasePagination<QuestionOutputModel[]> =
        await quizGameTestManager.getAllQuestions(adminAuthToken, null, 200);
      expect(getQuestionAfterUpdate.items).toHaveLength(1);
      expect(getQuestionAfterUpdate.items).toEqual([
        {
          id: questionId,
          body: updateBody.body,
          correctAnswers: updateBody.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);

      const publishBody: QuestionsPublishInputModel = {
        published: true,
      };
      await quizGameTestManager.publishQuestionById(
        adminAuthToken,
        questionId,
        publishBody,
        204,
      );
      await quizGameTestManager.deleteQuestion(adminAuthToken, questionId, 204);
    });
  });
});
