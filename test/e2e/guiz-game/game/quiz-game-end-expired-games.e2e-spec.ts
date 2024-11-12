import { QuestionsTestModel } from '../../../models/quiz-game/question/questions.model';
import { GameTestModel } from '../../../models/quiz-game/game/game.models';
import { ITestManger, ITestModels } from '../../../settings/interfaces';
import { QuizGameTestManager } from '../../../utils/request-test-manager/quiz-test-manager';
import { UserTestManager } from '../../../utils/request-test-manager/user-test-manager';
import { AuthTestManager } from '../../../utils/request-test-manager/auth-test-manager';
import {
  IUserCreateTestModel,
  IUserLoginTestModel,
} from '../../../models/user/interfaces';
import {
  QuestionsInputModel,
  QuestionsPublishInputModel,
} from '../../../../src/features/quiz-game/questions/api/models/input/questions-input.model';
import { QuestionOutputModel } from '../../../../src/features/quiz-game/questions/api/models/output/question-output.model';
import { AuthorizationUserResponseModel } from '../../../../src/base/types/types';
import { QuizGameAnswerQuestionInputModel } from '../../../../src/features/quiz-game/game/api/models/input/quiz-game-input.model';
import {
  CreateAndFinishGameWith2PlayersType,
  CreateAndFinishGameWith4PlayersType,
} from './quiz-game.e2e-spec';
import { delay } from '../../../utils/delay/delay';
import { QuizGameOutputModel } from '../../../../src/features/quiz-game/game/api/models/output/quiz-game-output.models';
import { QuizGameStatusEnum } from '../../../../src/features/quiz-game/game/domain/types';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { applyAppSettings } from '../../../../src/settings/apply-app-settings';
import { DataSource } from 'typeorm';
import { DataBase } from '../../../utils/database/database';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../src/settings/configuration/configuration';
import { NodeMailerService } from '../../../../src/features/nodemailer/application/nodemailer-application';
import { NodeMailerMockService } from '../../../mock/nodemailer-mock';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerMock } from '../../../mock/throttler-mock';
import { UserTestModel } from '../../../models/user/user.model';
import { AuthTestModel } from '../../../models/auth/auth.model';
import { BlogTestModel } from '../../../models/blog/blog.model';
import { PostTestModel } from '../../../models/post/post.model';
import { CommentsTestModel } from '../../../models/comments/comments.model';
import { LikeTestModel } from '../../../models/like/likes.model';
import { BlogTestManager } from '../../../utils/request-test-manager/blog-test-manager';
import { PostTestManager } from '../../../utils/request-test-manager/post-test-manager';
import { CommentTestManager } from '../../../utils/request-test-manager/comment-test-manager';
import { SecurityDevicesTestManager } from '../../../utils/request-test-manager/security-devices-test-manager';

describe('End Expired Games e2e test', () => {
  let app: INestApplication;
  let testManager: ITestManger;
  let testModels: ITestModels;
  let quizGameTestManager: QuizGameTestManager;
  let userTestManager: UserTestManager;
  let authTestManager: AuthTestManager;
  let userCreateModel: IUserCreateTestModel;
  let userLoginModel: IUserLoginTestModel;
  let userTwoCreateModel: IUserCreateTestModel;
  let userThreeCreateModel: IUserCreateTestModel;
  let userFourCreateModel: IUserCreateTestModel;
  let userTwoLoginModel: IUserLoginTestModel;
  let userThreeLoginModel: IUserLoginTestModel;
  let userFourLoginModel: IUserLoginTestModel;
  let questionsTestModel: QuestionsTestModel;
  let gameTestModel: GameTestModel;
  let dataBase: DataBase;
  let login: string;
  let password: string;
  let adminAuthToken: string;
  let userId1: string;
  let userId2: string;
  let userId3: string;
  let userId4: string;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  let accessTokenUser4: string;

  beforeAll(async () => {
    const getTestModel = (): ITestModels => {
      const userTestModel: UserTestModel = new UserTestModel();
      const authTestModel: AuthTestModel = new AuthTestModel(
        userTestModel.getUserCreateModel().email,
        userTestModel.getUserChangePasswordModel().recoveryCode,
      );
      const blogTestModel: BlogTestModel = new BlogTestModel();
      const postTestModel: PostTestModel = new PostTestModel();
      const commentsTestModel: CommentsTestModel = new CommentsTestModel(
        userTestModel.getUserCreateModel().login,
      );
      const likeTestModel: LikeTestModel = new LikeTestModel();

      return {
        userTestModel: userTestModel,
        authTestModel: authTestModel,
        blogTestModel: blogTestModel,
        postTestModel: postTestModel,
        likeTestModel: likeTestModel,
        commentsTestModel: commentsTestModel,
      };
    };
    const getTestManagers = (app: INestApplication): ITestManger => {
      const userTestManager = new UserTestManager(app);
      const blogTestManager: BlogTestManager = new BlogTestManager(app);
      const postTestManager: PostTestManager = new PostTestManager(app);
      const commentTestManager: CommentTestManager = new CommentTestManager(
        app,
      );
      const authTestManager: AuthTestManager = new AuthTestManager(app);
      const securityDevicesTestManager: SecurityDevicesTestManager =
        new SecurityDevicesTestManager(app);
      const quizGameTestManager: QuizGameTestManager = new QuizGameTestManager(
        app,
      );

      return {
        userTestManager: userTestManager,
        blogTestManager: blogTestManager,
        postTestManager: postTestManager,
        commentTestManager: commentTestManager,
        authTestManager: authTestManager,
        securityDevicesTestManager: securityDevicesTestManager,
        quizGameTestManager: quizGameTestManager,
      };
    };
    const setGlobalMock = (testingModule: TestingModuleBuilder) => {
      testingModule
        .overrideProvider(NodeMailerService)
        .useClass(NodeMailerMockService)
        .overrideGuard(ThrottlerGuard)
        .useClass(ThrottlerMock);
    };
    // Create test module
    const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule(
      {
        imports: [AppModule],
      },
    );
    setGlobalMock(testingModuleBuilder);
    const testingAppModule: TestingModule =
      await testingModuleBuilder.compile();
    app = testingAppModule.createNestApplication();
    applyAppSettings(app);
    await app.init();
    const dataSource: DataSource = await app.get(DataSource);
    dataBase = new DataBase(dataSource);
    testManager = getTestManagers(app);
    testModels = getTestModel();
    const configService = app.get(ConfigService<ConfigurationType, true>);

    const apiSettings = configService.get('apiSettings', {
      infer: true,
    });

    login = apiSettings.SUPER_ADMIN_AUTH.login;
    password = apiSettings.SUPER_ADMIN_AUTH.password;
    adminAuthToken = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;

    quizGameTestManager = testManager.quizGameTestManager;
    userTestManager = testManager.userTestManager;
    authTestManager = testManager.authTestManager;
    userCreateModel = testModels.userTestModel.getUserCreateModel();
    userLoginModel = testModels.userTestModel.getUserLoginModel();
    questionsTestModel = new QuestionsTestModel();
    gameTestModel = new GameTestModel();

    userTwoCreateModel = {
      login: 'user22',
      email: 'user22@gmail.com',
      password: 'user22',
    };
    userThreeCreateModel = {
      login: 'user333',
      email: 'user333@gmail.com',
      password: 'user333',
    };
    userFourCreateModel = {
      login: 'user4444',
      email: 'user4444@gmail.com',
      password: 'user4444',
    };
    userTwoLoginModel = {
      loginOrEmail: userTwoCreateModel.login,
      password: userTwoCreateModel.password,
    };
    userThreeLoginModel = {
      loginOrEmail: userThreeCreateModel.login,
      password: userThreeCreateModel.password,
    };
    userFourLoginModel = {
      loginOrEmail: userFourCreateModel.login,
      password: userFourCreateModel.password,
    };

    await dataBase.clearDatabase();
    await create4User();
    await createQuestions();
  });

  afterAll(async () => {
    await dataBase.clearDatabase();
    await app.close();
  });

  const createQuestions = async () => {
    const body: QuestionsInputModel = {
      body: questionsTestModel.body,
      correctAnswers: questionsTestModel.correctAnswers,
    };
    for (let i = 0; i < 10; i++) {
      const questionCreateResult: QuestionOutputModel =
        await quizGameTestManager.createQuestion(adminAuthToken, body, 201);
      const questionId: string = questionCreateResult.id;
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
  };
  /***********************************************************************************************************************************************/
  const create4User = async (): Promise<void> => {
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
    const result3 = await userTestManager.createUser(
      userThreeCreateModel,
      adminAuthToken,
      201,
    );
    userId3 = result3.id;
    const result4 = await userTestManager.createUser(
      userFourCreateModel,
      adminAuthToken,
      201,
    );
    userId4 = result4.id;

    const authUser1: AuthorizationUserResponseModel =
      await authTestManager.loginAndCheckCookie(userLoginModel, 200);
    const accessTokenUser1Auth = authUser1.accessToken;
    const authUser2: AuthorizationUserResponseModel =
      await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
    const accessTokenUser2Auth = authUser2.accessToken;
    const authUser3: AuthorizationUserResponseModel =
      await authTestManager.loginAndCheckCookie(userThreeLoginModel, 200);
    const accessTokenUser3Auth = authUser3.accessToken;
    const authUser4: AuthorizationUserResponseModel =
      await authTestManager.loginAndCheckCookie(userFourLoginModel, 200);
    const accessTokenUser4Auth = authUser4.accessToken;

    accessTokenUser1 = accessTokenUser1Auth;
    accessTokenUser2 = accessTokenUser2Auth;
    accessTokenUser3 = accessTokenUser3Auth;
    accessTokenUser4 = accessTokenUser4Auth;
  };
  /***********************************************************************************************************************************************/
  const createAndFinishGameWith2Players = async (
    accessTokenUser1: string,
    accessTokenUser2: string,
  ): Promise<CreateAndFinishGameWith2PlayersType> => {
    const game = await quizGameTestManager.createOrConnectToGame(
      `Bearer ${accessTokenUser1}`,
      200,
    );
    const gameId = game.id;
    await quizGameTestManager.createOrConnectToGame(
      `Bearer ${accessTokenUser2}`,
      200,
    );

    await answerForQuestion2Players(accessTokenUser1, accessTokenUser2);

    return {
      gameId: gameId,
    };
  };
  const answerForQuestion2Players = async (
    accessTokenUser1: string,
    accessTokenUser2: string,
  ): Promise<void> => {
    /*
      Game:
        * Player 1:
          - 3 correct (Answered - first)
          - 2 incorrect
        * Player 2:
          - 1 correct
          - 4 incorrect
    */
    const answerBody: QuizGameAnswerQuestionInputModel = {
      answer: gameTestModel.answerForCurrentQuestion1,
    };
    const answerIncorrectBody: QuizGameAnswerQuestionInputModel = {
      answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
    };
    // Answer by player 1
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerIncorrectBody,
      200,
    );
    // Answer by player 2
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerIncorrectBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerIncorrectBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerIncorrectBody,
      200,
    );

    // Lasts questions
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerIncorrectBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerIncorrectBody,
      200,
    );
  };
  /***********************************************************************************************************************************************/
  const createAndFinishGameWith4Players = async (
    accessTokenUser1: string,
    accessTokenUser2: string,
    accessTokenUser3: string,
    accessTokenUser4: string,
  ): Promise<CreateAndFinishGameWith4PlayersType> => {
    const game1 = await quizGameTestManager.createOrConnectToGame(
      `Bearer ${accessTokenUser1}`,
      200,
    );
    const gameId1 = game1.id;
    await quizGameTestManager.createOrConnectToGame(
      `Bearer ${accessTokenUser2}`,
      200,
    );

    const game2 = await quizGameTestManager.createOrConnectToGame(
      `Bearer ${accessTokenUser3}`,
      200,
    );
    const gameId2 = game2.id;
    await quizGameTestManager.createOrConnectToGame(
      `Bearer ${accessTokenUser4}`,
      200,
    );

    await answerForQuestion4Players(
      accessTokenUser1,
      accessTokenUser2,
      accessTokenUser3,
      accessTokenUser4,
    );

    return {
      gameId1: gameId1,
      gameId2: gameId2,
    };
  };
  const answerForQuestion4Players = async (
    accessTokenUser1: string,
    accessTokenUser2: string,
    accessTokenUser3: string,
    accessTokenUser4: string,
  ): Promise<void> => {
    /*
      Game 1:
        * Player 1:
          - 3 correct (Answered - first)
          - 2 incorrect
        * Player 2:
          - 1 correct
          - 4 incorrect
      Game 2:
        * Player 1:
          - 2 correct (Answered - first)
          - 3 incorrect
        * Player 2:
          - 4 correct
          - 1 incorrect
      */
    const answerBody: QuizGameAnswerQuestionInputModel = {
      answer: gameTestModel.answerForCurrentQuestion1,
    };
    const answerIncorrectBody: QuizGameAnswerQuestionInputModel = {
      answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
    };
    // Answer by player 1
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser1}`,
      answerIncorrectBody,
      200,
    );

    // Answer by player 2
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerIncorrectBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerIncorrectBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser2}`,
      answerIncorrectBody,
      200,
    );
    // Lasts answers
    await Promise.all([
      quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerIncorrectBody,
        200,
      ),
      quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerIncorrectBody,
        200,
      ),
    ]);

    // Answer by player 1
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser3}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser3}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser3}`,
      answerIncorrectBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser3}`,
      answerIncorrectBody,
      200,
    );
    // Answer by player 2
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser4}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser4}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser4}`,
      answerBody,
      200,
    );
    await quizGameTestManager.answerForCurrentGameQuestions(
      `Bearer ${accessTokenUser4}`,
      answerBody,
      200,
    );
    // Lasts questions
    await Promise.all([
      quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser3}`,
        answerIncorrectBody,
        200,
      ),
      quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser4}`,
        answerIncorrectBody,
        200,
      ),
    ]);
  };
  /***********************************************************************************************************************************************/

  describe('End game after 5 question', () => {
    it('Should end game after 5 answered question by player 1', async () => {
      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      await Promise.all([
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
      ]);

      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerBody,
        200,
      );
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerBody,
        200,
      );

      // Last question for first player
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerBody,
        200,
      );
      await delay(11000);

      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerBody,
        403,
      );
    }, 15000);

    it('create game1 by user1, connect to game by user2. Add 3 incorrect answers by user2. Add 4 correct answers by user1. Create game2 by user3, connect to game by user4. Add 5 correct answers by user3. Add 2 correct answers by user4. Add 2 correct answers by user2. Await 10 sec. Get game1 by user2. Should return finished game, status: "Finished", firstPlayerProgress.score: 4, secondPlayerProgress.score: 3, finishGameDate: not to be null. Get game2 by user3. Should return finished game - status: "Finished", firstPlayerProgress.score: 6, secondPlayerProgress.score: 2, finishGameDate: not to be null', async () => {
      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      const answerInCorrectBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };

      // Game 1
      const game1 = await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      const gameId1 = game1.id;
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      // Answer by player 2 (user 2) Game 1
      await Promise.all([
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerInCorrectBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerInCorrectBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerInCorrectBody,
          200,
        ),
      ]);
      // Answer by player 1 (user 1) Game 1
      await Promise.all([
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
      ]);

      // Game 2
      const game2 = await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser3}`,
        200,
      );
      const gameId2 = game2.id;
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser4}`,
        200,
      );

      // Answer by player 1 (user 3) Game 2
      await Promise.all([
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser3}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser3}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser3}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser3}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser3}`,
          answerBody,
          200,
        ),
      ]);
      // Answer by player 2 (user 4) Game 2
      await Promise.all([
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser4}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser4}`,
          answerBody,
          200,
        ),
      ]);

      // Answer by player 2 (user 2) Game 1
      await Promise.all([
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerBody,
          200,
        ),
      ]);
      await delay(10500);

      // Get game 1 by user 2
      const getGameByIdByUser2: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser2}`,
          gameId1,
          200,
        );
      expect(getGameByIdByUser2).toEqual({
        id: gameId1,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 4,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 3,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });

      // Get game 2 by user 3
      const getGameByIdByUser3: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser3}`,
          gameId2,
          200,
        );
      expect(getGameByIdByUser3).toEqual({
        id: gameId2,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId3,
            login: userThreeCreateModel.login,
          },
          score: 6,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId4,
            login: userFourCreateModel.login,
          },
          score: 2,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    }, 15000);
  });
});
