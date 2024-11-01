import { ITestSettings } from '../../../settings/interfaces';
import { APISettings } from '../../../../src/settings/api-settings';
import { QuestionsTestModel } from '../../../models/quiz-game/question/questions.model';
import { QuizGameTestManager } from '../../../utils/request-test-manager/quiz-test-manager';
import { initSettings } from '../../../settings/test-settings';
import { UserTestManager } from '../../../utils/request-test-manager/user-test-manager';
import {
  IUserCreateTestModel,
  IUserLoginTestModel,
} from '../../../models/user/interfaces';
import { AuthTestManager } from '../../../utils/request-test-manager/auth-test-manager';
import { AuthorizationUserResponseModel } from '../../../../src/base/types/types';
import { QuizGameOutputModel } from '../../../../src/features/quiz-game/game/api/models/output/quiz-game-output.models';
import { QuizGameStatusEnum } from '../../../../src/features/quiz-game/game/domain/types';
import {
  QuestionsInputModel,
  QuestionsPublishInputModel,
} from '../../../../src/features/quiz-game/questions/api/models/input/questions-input.model';
import { QuestionOutputModel } from '../../../../src/features/quiz-game/questions/api/models/output/question-output.model';
import { GameTestModel } from '../../../models/quiz-game/game/game.models';
import { QuizGameAnswerQuestionInputModel } from '../../../../src/features/quiz-game/game/api/models/input/quiz-game-input.model';
import { QuizCurrentGameAnswerStatusEnum } from '../../../../src/features/quiz-game/game-answer/domain/types';

describe('Quiz questions e2e', () => {
  let testSettings: ITestSettings;
  let apiSettings: APISettings;

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
    quizGameTestManager = testSettings.testManager.quizGameTestManager;
    userTestManager = testSettings.testManager.userTestManager;
    authTestManager = testSettings.testManager.authTestManager;
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
    userLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
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

  describe('Connect to current waiting game or create new pair game', () => {
    it('Should create new pair game', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(createGameResult.questions).toHaveLength(0);
      expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(createGameResult).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new game, and connect second player to game', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const { id: userId2 } = await userTestManager.createUser(
        userTwoCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;
      const authUser2: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
      const accessTokenUser2 = authUser2.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;
      const gameCreatedAt: string = createGameResult.pairCreatedDate;

      expect(createGameResult.questions).toHaveLength(0);
      expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(createGameResult).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      const connectToGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(connectToGameResult.questions).toHaveLength(1);
      expect(connectToGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(connectToGameResult.secondPlayerProgress.answers).toHaveLength(0);
      expect(connectToGameResult).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: gameCreatedAt,
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });

    it('Should create new game, connect second player, and return new info about game for first player', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const { id: userId2 } = await userTestManager.createUser(
        userTwoCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;
      const authUser2: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
      const accessTokenUser2 = authUser2.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;
      const gameCreatedAt: string = createGameResult.pairCreatedDate;

      expect(createGameResult.questions).toHaveLength(0);
      expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(createGameResult).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      const connectToGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(connectToGameResult.questions).toHaveLength(1);
      expect(connectToGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(connectToGameResult.secondPlayerProgress.answers).toHaveLength(0);
      expect(connectToGameResult).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: gameCreatedAt,
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const getGameByFirstUser: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );

      expect(getGameByFirstUser.questions).toHaveLength(1);
      expect(getGameByFirstUser.firstPlayerProgress.answers).toHaveLength(0);
      expect(getGameByFirstUser.secondPlayerProgress.answers).toHaveLength(0);
      expect(getGameByFirstUser).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: gameCreatedAt,
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });

    it('Should create new game with user 1 and 2, then create game for user 3 and 4, then return correct current unfinished game, for users', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const { id: userId2 } = await userTestManager.createUser(
        userTwoCreateModel,
        adminAuthToken,
        201,
      );
      const { id: userId3 } = await userTestManager.createUser(
        userThreeCreateModel,
        adminAuthToken,
        201,
      );
      const { id: userId4 } = await userTestManager.createUser(
        userFourCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;
      const authUser2: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
      const accessTokenUser2 = authUser2.accessToken;
      const authUser3: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userThreeLoginModel, 200);
      const accessTokenUser3 = authUser3.accessToken;
      const authUser4: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userFourLoginModel, 200);
      const accessTokenUser4 = authUser4.accessToken;

      const createGameResultUser1: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameIdByUser1: string = createGameResultUser1.id;

      const connectToGameResultUser2: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser2}`,
          200,
        );
      const gameIdByUser2: string = connectToGameResultUser2.id;

      expect(gameIdByUser1).toBe(gameIdByUser2);

      const createGameResultUser3: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser3}`,
          200,
        );
      const gameIdByUser3: string = createGameResultUser3.id;

      const connectToGameResultUser4: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser4}`,
          200,
        );
      const gameIdByUser4: string = connectToGameResultUser4.id;

      expect(gameIdByUser3).toBe(gameIdByUser4);

      const getGameByFirstUser: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(getGameByFirstUser.questions).toHaveLength(1);
      expect(getGameByFirstUser.firstPlayerProgress.answers).toHaveLength(0);
      expect(getGameByFirstUser.secondPlayerProgress.answers).toHaveLength(0);
      expect(getGameByFirstUser).toEqual({
        id: gameIdByUser1,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const getGameBySecondUser: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(getGameBySecondUser.questions).toHaveLength(1);
      expect(getGameBySecondUser.firstPlayerProgress.answers).toHaveLength(0);
      expect(getGameBySecondUser.secondPlayerProgress.answers).toHaveLength(0);
      expect(getGameBySecondUser).toEqual({
        id: gameIdByUser2,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const getGameByUserThree: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser3}`,
          200,
        );

      expect(getGameByUserThree.questions).toHaveLength(1);
      expect(getGameByUserThree.firstPlayerProgress.answers).toHaveLength(0);
      expect(getGameByUserThree.secondPlayerProgress.answers).toHaveLength(0);
      expect(getGameByUserThree).toEqual({
        id: gameIdByUser3,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId3,
            login: userThreeCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId4,
            login: userFourCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const getGameByUserFour: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser4}`,
          200,
        );

      expect(getGameByUserFour.questions).toHaveLength(1);
      expect(getGameByUserFour.firstPlayerProgress.answers).toHaveLength(0);
      expect(getGameByUserFour.secondPlayerProgress.answers).toHaveLength(0);
      expect(getGameByUserFour).toEqual({
        id: gameIdByUser4,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId3,
            login: userThreeCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId4,
            login: userFourCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });

    it('Should not create new pair game, unauthorized', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      await quizGameTestManager.createOrConnectToGame(
        `Bearer accessTokenUser1`,
        401,
      );
    });

    it('Should create new game, and should not connect from second player to game, unauthorized', async () => {
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      await userTestManager.createUser(userTwoCreateModel, adminAuthToken, 201);

      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(createGameResult.questions).toHaveLength(0);
      expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(createGameResult).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      await quizGameTestManager.createOrConnectToGame(
        `Bearer accessTokenUser2`,
        401,
      );
    });

    it('Should create new pair game with user 1 then connect user 1 to new game, error 403 user has active game', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(createGameResult.questions).toHaveLength(0);
      expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(createGameResult).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        403,
      );
    });
  });

  describe('Get game', () => {
    it('Should create new pair game and get game by id', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;

      expect(createGameResult.questions).toHaveLength(0);
      expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(createGameResult).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      const getGameById: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );

      expect(getGameById.questions).toHaveLength(0);
      expect(getGameById.firstPlayerProgress.answers).toHaveLength(0);
      expect(getGameById).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new pair game and should not get game by id, user is not participant', async () => {
      await createQuestions();
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      await userTestManager.createUser(userTwoCreateModel, adminAuthToken, 201);
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;
      const authUser2: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
      const accessTokenUser2 = authUser2.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;

      await quizGameTestManager.getGameByID(
        `Bearer ${accessTokenUser2}`,
        gameId,
        403,
      );
    });

    it('Should create new pair game and should not get game by id, unauthorized', async () => {
      await createQuestions();
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );

      await quizGameTestManager.getGameByID(`Bearer accessTokenUser1`, 1, 401);
    });

    it('Should create new pair game and should not get game by id, game not found', async () => {
      await createQuestions();
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );

      await quizGameTestManager.getGameByID(
        `Bearer ${accessTokenUser1}`,
        '22',
        404,
      );
    });

    it('Should create new pair game and get current user game', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;

      expect(createGameResult.questions).toHaveLength(0);
      expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
      expect(createGameResult).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      const getCurrentUserGame: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(getCurrentUserGame.questions).toHaveLength(0);
      expect(getCurrentUserGame.firstPlayerProgress.answers).toHaveLength(0);
      expect(getCurrentUserGame).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: expect.any(Array),
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new pair game and should not get current user game, unauthorized', async () => {
      await createQuestions();
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      await quizGameTestManager.getGameCurrentUser(
        `Bearer accessTokenUser1`,
        401,
      );
    });

    it('Should not get current user game, game is not found', async () => {
      await createQuestions();
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;

      await quizGameTestManager.getGameCurrentUser(
        `Bearer ${accessTokenUser1}`,
        404,
      );
    });
  });

  describe('Answer to question', () => {
    it('Should create new pair game, connect to game, and both users should take answer for first question', async () => {
      await createQuestions();
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      await userTestManager.createUser(userTwoCreateModel, adminAuthToken, 201);
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;
      const authUser2: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
      const accessTokenUser2 = authUser2.accessToken;

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };

      const answerBodyUnCorrect: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };

      const answerUser1Result =
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        );

      expect(answerUser1Result).toEqual({
        questionId: expect.any(String),
        answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
        addedAt: expect.any(String),
      });

      const answerUser2Result =
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerBodyUnCorrect,
          200,
        );

      expect(answerUser2Result).toEqual({
        questionId: expect.any(String),
        answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
        addedAt: expect.any(String),
      });
    });

    it('Should create new pair game, connect to game, and user 1 take answer for 3 questions first and second correct, three incorrect, user 2 take answer for 2 question, first incorrect second correct', async () => {
      await createQuestions();
      const { id: userId1 } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      const { id: userId2 } = await userTestManager.createUser(
        userTwoCreateModel,
        adminAuthToken,
        201,
      );
      const authUser1: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userLoginModel, 200);
      const accessTokenUser1 = authUser1.accessToken;
      const authUser2: AuthorizationUserResponseModel =
        await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
      const accessTokenUser2 = authUser2.accessToken;

      // Start
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      // Connect
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      const answerBody2: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion2,
      };
      const answerBody3: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion3,
      };

      const answerBodyUnCorrect: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };

      // Answer by user 1 - 1
      const answerUser1Result1 =
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        );

      expect(answerUser1Result1).toEqual({
        questionId: expect.any(String),
        answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
        addedAt: expect.any(String),
      });

      // Answer by user 1 - 2
      const answerUser1Result2 =
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody2,
          200,
        );

      expect(answerUser1Result2).toEqual({
        questionId: expect.any(String),
        answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
        addedAt: expect.any(String),
      });

      // Check result user 1
      const getCurrentGameByUser1Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(getCurrentGameByUser1Result1.questions).toHaveLength(3);
      expect(getCurrentGameByUser1Result1).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: expect.any(Array),
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      // Check result user 2
      const getCurrentGameByUser2Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(getCurrentGameByUser2Result1.questions).toHaveLength(1);
      expect(getCurrentGameByUser2Result1).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [],
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      // Answer by user 2 - 1
      const answerUser2Result =
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerBodyUnCorrect,
          200,
        );

      expect(answerUser2Result).toEqual({
        questionId: expect.any(String),
        answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
        addedAt: expect.any(String),
      });

      // Check result user 1
      const getCurrentGameByUser1Result2: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(getCurrentGameByUser1Result2.questions).toHaveLength(3);
      expect(getCurrentGameByUser1Result2).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      // Check result user 2
      const getCurrentGameByUser2Result2: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(getCurrentGameByUser2Result2.questions).toHaveLength(2);
      expect(getCurrentGameByUser2Result2).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      // Answer by user 1 - 3
      const answerUser1Result3 =
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBodyUnCorrect,
          200,
        );

      expect(answerUser1Result3).toEqual({
        questionId: expect.any(String),
        answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
        addedAt: expect.any(String),
      });

      // Answer by user 2 - 2
      const answerUser2Result2 =
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerBody3,
          200,
        );

      expect(answerUser2Result2).toEqual({
        questionId: expect.any(String),
        answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
        addedAt: expect.any(String),
      });

      // Check result user 1
      const getCurrentGameByUser1Result3: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(getCurrentGameByUser1Result3.questions).toHaveLength(4);
      expect(getCurrentGameByUser1Result3).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 1,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      // Check result user 2
      const getCurrentGameByUser2Result3: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(getCurrentGameByUser2Result3.questions).toHaveLength(3);
      expect(getCurrentGameByUser2Result3).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 1,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });

    // it('Should create new game, and connect second player to game', async () => {
    //   await createQuestions();
    //   const { id: userId1 } = await userTestManager.createUser(
    //     userCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const { id: userId2 } = await userTestManager.createUser(
    //     userTwoCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const authUser1: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userLoginModel, 200);
    //   const accessTokenUser1 = authUser1.accessToken;
    //   const authUser2: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
    //   const accessTokenUser2 = authUser2.accessToken;
    //
    //   const createGameResult: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser1}`,
    //       200,
    //     );
    //   const gameId: string = createGameResult.id;
    //   const gameCreatedAt: string = createGameResult.pairCreatedDate;
    //
    //   expect(createGameResult.questions).toHaveLength(0);
    //   expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(createGameResult).toEqual({
    //     id: expect.any(String),
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: null,
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.PendingSecondPlayer,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: null,
    //     finishGameDate: null,
    //   });
    //
    //   const connectToGameResult: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser2}`,
    //       200,
    //     );
    //
    //   expect(connectToGameResult.questions).toHaveLength(1);
    //   expect(connectToGameResult.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(connectToGameResult.secondPlayerProgress.answers).toHaveLength(0);
    //   expect(connectToGameResult).toEqual({
    //     id: gameId,
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId2,
    //         login: userTwoCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.Active,
    //     pairCreatedDate: gameCreatedAt,
    //     startGameDate: expect.any(String),
    //     finishGameDate: null,
    //   });
    // });
    //
    // it('Should create new game, connect second player, and return new info about game for first player', async () => {
    //   await createQuestions();
    //   const { id: userId1 } = await userTestManager.createUser(
    //     userCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const { id: userId2 } = await userTestManager.createUser(
    //     userTwoCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const authUser1: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userLoginModel, 200);
    //   const accessTokenUser1 = authUser1.accessToken;
    //   const authUser2: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
    //   const accessTokenUser2 = authUser2.accessToken;
    //
    //   const createGameResult: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser1}`,
    //       200,
    //     );
    //   const gameId: string = createGameResult.id;
    //   const gameCreatedAt: string = createGameResult.pairCreatedDate;
    //
    //   expect(createGameResult.questions).toHaveLength(0);
    //   expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(createGameResult).toEqual({
    //     id: expect.any(String),
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: null,
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.PendingSecondPlayer,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: null,
    //     finishGameDate: null,
    //   });
    //
    //   const connectToGameResult: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser2}`,
    //       200,
    //     );
    //
    //   expect(connectToGameResult.questions).toHaveLength(1);
    //   expect(connectToGameResult.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(connectToGameResult.secondPlayerProgress.answers).toHaveLength(0);
    //   expect(connectToGameResult).toEqual({
    //     id: gameId,
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId2,
    //         login: userTwoCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.Active,
    //     pairCreatedDate: gameCreatedAt,
    //     startGameDate: expect.any(String),
    //     finishGameDate: null,
    //   });
    //
    //   const getGameByFirstUser: QuizGameOutputModel =
    //     await quizGameTestManager.getGameByID(
    //       `Bearer ${accessTokenUser1}`,
    //       gameId,
    //       200,
    //     );
    //
    //   expect(getGameByFirstUser.questions).toHaveLength(1);
    //   expect(getGameByFirstUser.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByFirstUser.secondPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByFirstUser).toEqual({
    //     id: gameId,
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId2,
    //         login: userTwoCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.Active,
    //     pairCreatedDate: gameCreatedAt,
    //     startGameDate: expect.any(String),
    //     finishGameDate: null,
    //   });
    // });
    //
    // it('Should create new game with user 1 and 2, then create game for user 3 and 4, then return correct current unfinished game, for users', async () => {
    //   await createQuestions();
    //   const { id: userId1 } = await userTestManager.createUser(
    //     userCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const { id: userId2 } = await userTestManager.createUser(
    //     userTwoCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const { id: userId3 } = await userTestManager.createUser(
    //     userThreeCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const { id: userId4 } = await userTestManager.createUser(
    //     userFourCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const authUser1: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userLoginModel, 200);
    //   const accessTokenUser1 = authUser1.accessToken;
    //   const authUser2: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userTwoLoginModel, 200);
    //   const accessTokenUser2 = authUser2.accessToken;
    //   const authUser3: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userThreeLoginModel, 200);
    //   const accessTokenUser3 = authUser3.accessToken;
    //   const authUser4: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userFourLoginModel, 200);
    //   const accessTokenUser4 = authUser4.accessToken;
    //
    //   const createGameResultUser1: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser1}`,
    //       200,
    //     );
    //   const gameIdByUser1: string = createGameResultUser1.id;
    //
    //   const connectToGameResultUser2: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser2}`,
    //       200,
    //     );
    //   const gameIdByUser2: string = connectToGameResultUser2.id;
    //
    //   expect(gameIdByUser1).toBe(gameIdByUser2);
    //
    //   const createGameResultUser3: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser3}`,
    //       200,
    //     );
    //   const gameIdByUser3: string = createGameResultUser3.id;
    //
    //   const connectToGameResultUser4: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser4}`,
    //       200,
    //     );
    //   const gameIdByUser4: string = connectToGameResultUser4.id;
    //
    //   expect(gameIdByUser3).toBe(gameIdByUser4);
    //
    //   const getGameByFirstUser: QuizGameOutputModel =
    //     await quizGameTestManager.getGameCurrentUser(
    //       `Bearer ${accessTokenUser1}`,
    //       200,
    //     );
    //
    //   expect(getGameByFirstUser.questions).toHaveLength(1);
    //   expect(getGameByFirstUser.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByFirstUser.secondPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByFirstUser).toEqual({
    //     id: gameIdByUser1,
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId2,
    //         login: userTwoCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.Active,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: expect.any(String),
    //     finishGameDate: null,
    //   });
    //
    //   const getGameBySecondUser: QuizGameOutputModel =
    //     await quizGameTestManager.getGameCurrentUser(
    //       `Bearer ${accessTokenUser2}`,
    //       200,
    //     );
    //
    //   expect(getGameBySecondUser.questions).toHaveLength(1);
    //   expect(getGameBySecondUser.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameBySecondUser.secondPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameBySecondUser).toEqual({
    //     id: gameIdByUser2,
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId2,
    //         login: userTwoCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.Active,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: expect.any(String),
    //     finishGameDate: null,
    //   });
    //
    //   const getGameByUserThree: QuizGameOutputModel =
    //     await quizGameTestManager.getGameCurrentUser(
    //       `Bearer ${accessTokenUser3}`,
    //       200,
    //     );
    //
    //   expect(getGameByUserThree.questions).toHaveLength(1);
    //   expect(getGameByUserThree.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByUserThree.secondPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByUserThree).toEqual({
    //     id: gameIdByUser3,
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId3,
    //         login: userThreeCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId4,
    //         login: userFourCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.Active,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: expect.any(String),
    //     finishGameDate: null,
    //   });
    //
    //   const getGameByUserFour: QuizGameOutputModel =
    //     await quizGameTestManager.getGameCurrentUser(
    //       `Bearer ${accessTokenUser4}`,
    //       200,
    //     );
    //
    //   expect(getGameByUserFour.questions).toHaveLength(1);
    //   expect(getGameByUserFour.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByUserFour.secondPlayerProgress.answers).toHaveLength(0);
    //   expect(getGameByUserFour).toEqual({
    //     id: gameIdByUser4,
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId3,
    //         login: userThreeCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId4,
    //         login: userFourCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.Active,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: expect.any(String),
    //     finishGameDate: null,
    //   });
    // });
    //
    // it('Should not create new pair game, unauthorized', async () => {
    //   await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
    //   await quizGameTestManager.createOrConnectToGame(
    //     `Bearer accessTokenUser1`,
    //     401,
    //   );
    // });
    //
    // it('Should create new game, and should not connect from second player to game, unauthorized', async () => {
    //   const { id: userId1 } = await userTestManager.createUser(
    //     userCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   await userTestManager.createUser(userTwoCreateModel, adminAuthToken, 201);
    //
    //   const authUser1: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userLoginModel, 200);
    //   const accessTokenUser1 = authUser1.accessToken;
    //
    //   const createGameResult: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser1}`,
    //       200,
    //     );
    //
    //   expect(createGameResult.questions).toHaveLength(0);
    //   expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(createGameResult).toEqual({
    //     id: expect.any(String),
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: null,
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.PendingSecondPlayer,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: null,
    //     finishGameDate: null,
    //   });
    //
    //   await quizGameTestManager.createOrConnectToGame(
    //     `Bearer accessTokenUser2`,
    //     401,
    //   );
    // });
    //
    // it('Should create new pair game with user 1 then connect user 1 to new game, error 403 user has active game', async () => {
    //   await createQuestions();
    //   const { id: userId1 } = await userTestManager.createUser(
    //     userCreateModel,
    //     adminAuthToken,
    //     201,
    //   );
    //   const authUser1: AuthorizationUserResponseModel =
    //     await authTestManager.loginAndCheckCookie(userLoginModel, 200);
    //   const accessTokenUser1 = authUser1.accessToken;
    //
    //   const createGameResult: QuizGameOutputModel =
    //     await quizGameTestManager.createOrConnectToGame(
    //       `Bearer ${accessTokenUser1}`,
    //       200,
    //     );
    //
    //   expect(createGameResult.questions).toHaveLength(0);
    //   expect(createGameResult.firstPlayerProgress.answers).toHaveLength(0);
    //   expect(createGameResult).toEqual({
    //     id: expect.any(String),
    //     firstPlayerProgress: {
    //       answers: expect.any(Array),
    //       player: {
    //         id: userId1,
    //         login: userCreateModel.login,
    //       },
    //       score: 0,
    //     },
    //     secondPlayerProgress: null,
    //     questions: expect.any(Array),
    //     status: QuizGameStatusEnum.PendingSecondPlayer,
    //     pairCreatedDate: expect.any(String),
    //     startGameDate: null,
    //     finishGameDate: null,
    //   });
    //
    //   await quizGameTestManager.createOrConnectToGame(
    //     `Bearer ${accessTokenUser1}`,
    //     403,
    //   );
    // });
  });
});
