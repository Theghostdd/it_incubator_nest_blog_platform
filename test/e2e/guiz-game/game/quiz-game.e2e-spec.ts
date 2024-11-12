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
import {
  QuizGameOutputModel,
  QuizGameStatisticModel,
  QuizGameStatisticWithPlayerInfoModel,
} from '../../../../src/features/quiz-game/game/api/models/output/quiz-game-output.models';
import { QuizGameStatusEnum } from '../../../../src/features/quiz-game/game/domain/types';
import {
  QuestionsInputModel,
  QuestionsPublishInputModel,
} from '../../../../src/features/quiz-game/questions/api/models/input/questions-input.model';
import { QuestionOutputModel } from '../../../../src/features/quiz-game/questions/api/models/output/question-output.model';
import { GameTestModel } from '../../../models/quiz-game/game/game.models';
import {
  QuizGameAnswerQuestionInputModel,
  QuizGameQuery,
} from '../../../../src/features/quiz-game/game/api/models/input/quiz-game-input.model';
import { QuizCurrentGameAnswerStatusEnum } from '../../../../src/features/quiz-game/game-answer/domain/types';
import { BasePagination } from '../../../../src/base/pagination/base-pagination';
import { delay } from '../../../utils/delay/delay';

export type Create2UsersType = {
  accessTokenUser1: string;
  accessTokenUser2: string;
  userId1: string;
  userId2: string;
};
export type Create4UsersType = Create2UsersType & {
  accessTokenUser3: string;
  accessTokenUser4: string;
  userId3: string;
  userId4: string;
};
export type CreateAndFinishGameWith2PlayersType = {
  gameId: string;
};

export type CreateAndFinishGameWith4PlayersType = {
  gameId1: string;
  gameId2: string;
};

describe('Quiz game e2e', () => {
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
  /***********************************************************************************************************************************************/
  const create2User = async (): Promise<Create2UsersType> => {
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

    return {
      accessTokenUser1: accessTokenUser1,
      accessTokenUser2: accessTokenUser2,
      userId1: userId1,
      userId2: userId2,
    };
  };
  const create4User = async (): Promise<Create4UsersType> => {
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

    return {
      accessTokenUser1: accessTokenUser1,
      accessTokenUser2: accessTokenUser2,
      accessTokenUser3: accessTokenUser3,
      accessTokenUser4: accessTokenUser4,
      userId1: userId1,
      userId2: userId2,
      userId3: userId3,
      userId4: userId4,
    };
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
  ) => {
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
  ) => {
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

  describe('Connect to current waiting game or create new pair game', () => {
    it('Should create new pair game', async () => {
      await createQuestions();
      const { userId1, accessTokenUser1 } = await create2User();

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );

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
        questions: null,
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new game, and connect second player to game', async () => {
      await createQuestions();
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;
      const gameCreatedAt: string = createGameResult.pairCreatedDate;

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
        questions: null,
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

      expect(connectToGameResult.questions).toHaveLength(5);
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
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;
      const gameCreatedAt: string = createGameResult.pairCreatedDate;

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
        questions: null,
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

      expect(connectToGameResult.questions).toHaveLength(5);
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
      expect(connectToGameResult.questions).toEqual([
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
      ]);

      const getGameByFirstUser: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );

      expect(getGameByFirstUser.questions).toHaveLength(5);
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
      const {
        userId1,
        userId2,
        userId3,
        userId4,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

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

      expect(getGameByFirstUser.questions).toHaveLength(5);
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

      expect(getGameBySecondUser.questions).toHaveLength(5);
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

      expect(getGameByUserThree.questions).toHaveLength(5);
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

      expect(getGameByUserFour.questions).toHaveLength(5);
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
      await createQuestions();
      const { userId1, accessTokenUser1 } = await create2User();

      const game = await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      const gameId = game.id;

      await quizGameTestManager.createOrConnectToGame(
        `Bearer accessTokenUser2`,
        401,
      );

      const getGame: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(getGame).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: [],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new pair game with user 1 then connect user 1 to new game, error 403 user has active game', async () => {
      await createQuestions();
      const { accessTokenUser1 } = await create2User();

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        403,
      );
    });

    it('Should not create new pair game, questions not found, 500', async () => {
      const { accessTokenUser1 } = await create2User();

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        500,
      );
    });
  });

  describe('Answer to question', () => {
    it('Should create new pair game, connect to game, and both users should take answer for first question', async () => {
      await createQuestions();
      const { accessTokenUser1, accessTokenUser2 } = await create2User();
      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };

      const answerBodyUnCorrect: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

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
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();
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

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

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
      expect(getCurrentGameByUser1Result1.questions).toHaveLength(5);
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
      expect(getCurrentGameByUser1Result1.questions).toEqual([
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
      ]);

      // Check result user 2
      const getCurrentGameByUser2Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );
      expect(getCurrentGameByUser2Result1.questions).toHaveLength(5);
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
      expect(getCurrentGameByUser2Result1.questions).toEqual([
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
      ]);

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
      expect(getCurrentGameByUser1Result2.questions).toHaveLength(5);
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
      expect(getCurrentGameByUser2Result2.questions).toHaveLength(5);
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
      expect(getCurrentGameByUser1Result3.questions).toHaveLength(5);
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
      expect(getCurrentGameByUser2Result3.questions).toHaveLength(5);
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

    it('Should create new pair game, connect to game then should not take answer to question, unauthorized', async () => {
      await createQuestions();
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();
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

      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer accessTokenUser1`,
        answerBody,
        401,
      );

      // Check result user 1
      const getCurrentGameByUser1Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      expect(getCurrentGameByUser1Result1.questions).toHaveLength(5);
      expect(getCurrentGameByUser1Result1).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
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

      // Check result user 2
      const getCurrentGameByUser2Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );
      expect(getCurrentGameByUser2Result1.questions).toHaveLength(5);
      expect(getCurrentGameByUser2Result1).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
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
    });

    it('Should create new pair game, then user 3 should not take answer for questions, 403, user is not inside active pair', async () => {
      await createQuestions();
      const {
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        userId1,
        userId2,
      } = await create4User();

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

      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser3}`,
        answerBody,
        403,
      );

      // Check result user 1
      const getCurrentGameByUser1Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      expect(getCurrentGameByUser1Result1.questions).toHaveLength(5);
      expect(getCurrentGameByUser1Result1).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
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

      // Check result user 2
      const getCurrentGameByUser2Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(getCurrentGameByUser2Result1.questions).toHaveLength(5);
      expect(getCurrentGameByUser2Result1).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
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

      // Check result user 3
      await quizGameTestManager.getGameCurrentUser(
        `Bearer ${accessTokenUser3}`,
        404,
      );
    });

    it('Should create new pair game then connect to game, player 1 should take answer for all question, player 2 to 3 question then player 1 should not take answer again player 1 has already answered to all questions, game does not finished', async () => {
      await createQuestions();
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();

      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      const answerUncorrectBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };

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

      // 5 Answers by player 1
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
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerBody,
          200,
        ),
      ]);

      // 3 answers by player 2
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerUncorrectBody,
        200,
      );
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

      // Check result user 1
      const getCurrentGameByUser1Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      expect(getCurrentGameByUser1Result1.questions).toHaveLength(5);
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 5,
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
          score: 2,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      // Check result by user 2
      const getCurrentGameByUser2Result1: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );
      expect(getCurrentGameByUser2Result1.questions).toHaveLength(5);
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 5,
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
          score: 2,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      // Try to take answer again after 5 answers
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerBody,
        403,
      );

      // Answer by player 2
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerUncorrectBody,
        200,
      );

      // Check result by user 2
      const getCurrentGameByUser2Result2: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );
      expect(getCurrentGameByUser2Result2.questions).toHaveLength(5);
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 5,
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
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 2,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });

    it('Should create new pair game then connect to game, players should take answers for all questions, game should be finished then user should not take answer, 404 current game not found, try to take answer again, 403 player 1 does not has active game ', async () => {
      await createQuestions();
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();
      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      const { gameId } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );

      // Check result user 1 by current game
      await quizGameTestManager.getGameCurrentUser(
        `Bearer ${accessTokenUser1}`,
        404,
      );
      // Check result by user 2 by current game
      await quizGameTestManager.getGameCurrentUser(
        `Bearer ${accessTokenUser2}`,
        404,
      );

      // Check result user 1 by game id
      const getGameByIdResultUser1: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );

      expect(getGameByIdResultUser1.questions).toHaveLength(5);
      expect(getGameByIdResultUser1).toEqual({
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
          score: 4,
        },
        secondPlayerProgress: {
          answers: [
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
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
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
          score: 1,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });

      // Check result by user 2 by game id
      const getGameByIdResultUser2: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );
      expect(getGameByIdResultUser2.questions).toHaveLength(5);
      expect(getGameByIdResultUser2).toEqual({
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
          score: 4,
        },
        secondPlayerProgress: {
          answers: [
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
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
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
          score: 1,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });

      // Try to take answer again after 5 answers
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerBody,
        403,
      );

      // Check result by user 2, after answer
      const getGameByIdResultUser3: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );
      expect(getGameByIdResultUser3.questions).toHaveLength(5);
      expect(getGameByIdResultUser3).toEqual({
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
          score: 4,
        },
        secondPlayerProgress: {
          answers: [
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
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
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
          score: 1,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });

    it('Should create new game by user1, try to add answer by user1. Should return error if current user is not inside active pair; status 403', async () => {
      await createQuestions();
      const { accessTokenUser1, userId1 } = await create2User();
      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      const createResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createResult.id;

      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerBody,
        403,
      );

      // Check game
      const getGameById: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );
      expect(getGameById).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: userId1,
            login: userCreateModel.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new pair game, connect to game, and both users should take answer, second player must be winner', async () => {
      await createQuestions();
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();
      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      const answerInCorrectBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };
      const game = await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      const gameId = game.id;
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      // Answer by player 1
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerInCorrectBody,
        200,
      );
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerInCorrectBody,
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
        answerBody,
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
        answerBody,
        200,
      );
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
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerBody,
        200,
      );

      // Check result by user 1
      const getCurrentGameResult1User1: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );
      expect(getCurrentGameResult1User1).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
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
          score: 4,
        },
        secondPlayerProgress: {
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 5,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });

    it('Should create new pair game, connect to game, and both users should take answer, must be draw', async () => {
      await createQuestions();
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();
      const answerBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.answerForCurrentQuestion1,
      };
      const answerInCorrectBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };
      const game = await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      const gameId = game.id;
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      // Answer by player 1
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerInCorrectBody,
        200,
      );
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser1}`,
        answerInCorrectBody,
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
        answerBody,
        200,
      );
      // Answer by player 2
      await quizGameTestManager.answerForCurrentGameQuestions(
        `Bearer ${accessTokenUser2}`,
        answerInCorrectBody,
        200,
      );
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

      // Check result by player 1
      const getCurrentGameResult1User1: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );
      expect(getCurrentGameResult1User1).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
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
          score: 4,
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userId2,
            login: userTwoCreateModel.login,
          },
          score: 4,
        },
        questions: expect.any(Array),
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });

    it('Should create new pair game, connect to game, and both users should take incorrect answer, must be draw, score 0', async () => {
      await createQuestions();
      const { userId1, userId2, accessTokenUser1, accessTokenUser2 } =
        await create2User();
      const answerInCorrectBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };
      const game = await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      const gameId = game.id;
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      // Answer by player 1
      await Promise.all([
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerInCorrectBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerInCorrectBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerInCorrectBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerInCorrectBody,
          200,
        ),
        quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerInCorrectBody,
          200,
        ),
      ]);
      // Answer by player 2
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

      // Check result by player 1
      const getCurrentGameResult1User1: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );
      expect(getCurrentGameResult1User1).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
          score: 0,
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
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
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });

      // Check result by player 2
      const getCurrentGameResult1User2: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );
      expect(getCurrentGameResult1User2).toEqual({
        id: gameId,
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
          score: 0,
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
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
              addedAt: expect.any(String),
            },
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
        status: QuizGameStatusEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });
  });

  describe('Get game', () => {
    it('Should create new pair game and get game by id', async () => {
      await createQuestions();
      const { userId1, accessTokenUser1 } = await create2User();

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;

      const getGameById: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          gameId,
          200,
        );

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
        questions: null,
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new pair game and should not get game by id, id is not correct, error 400', async () => {
      await createQuestions();
      const { accessTokenUser1 } = await create2User();

      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );

      const getGameById: QuizGameOutputModel =
        await quizGameTestManager.getGameByID(
          `Bearer ${accessTokenUser1}`,
          'gameId',
          400,
        );
      expect(getGameById).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'id',
          },
        ],
      });
    });

    it('Should create new pair game and should not get game by id, user is not participant', async () => {
      await createQuestions();
      const { accessTokenUser1, accessTokenUser2 } = await create2User();

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
      await quizGameTestManager.getGameByID(`Bearer accessTokenUser1`, 1, 401);
    });

    it('Should create new pair game and should not get game by id, game not found', async () => {
      await createQuestions();
      const { accessTokenUser1 } = await create2User();
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
      const { userId1, accessTokenUser1 } = await create2User();

      const createGameResult: QuizGameOutputModel =
        await quizGameTestManager.createOrConnectToGame(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      const gameId: string = createGameResult.id;

      const getCurrentUserGame: QuizGameOutputModel =
        await quizGameTestManager.getGameCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

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
        questions: null,
        status: QuizGameStatusEnum.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
    });

    it('Should create new pair game and should not get current user game, unauthorized', async () => {
      await quizGameTestManager.getGameCurrentUser(
        `Bearer accessTokenUser1`,
        401,
      );
    });

    it('Should not get current user game, game is not found', async () => {
      await createQuestions();
      const { accessTokenUser1 } = await create2User();

      await quizGameTestManager.getGameCurrentUser(
        `Bearer ${accessTokenUser1}`,
        404,
      );
    });
  });

  describe('Get all current player games', () => {
    it('Should create and finish 3 games by user 1 and 2, get all games by user 1 and 2 without pagination, additional create game with user 3 and 4', async () => {
      await createQuestions();
      const {
        userId1,
        userId2,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

      // Create game for user 3 and 4
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser3}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser4}`,
        200,
      );

      const { gameId: gameId1 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );
      const { gameId: gameId2 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );
      const { gameId: gameId3 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );

      const getCurrentAllGamesByUser1: BasePagination<
        QuizGameOutputModel[] | []
      > = await quizGameTestManager.getAllGamesCurrentUser(
        `Bearer ${accessTokenUser1}`,
        {},
        200,
      );

      expect(getCurrentAllGamesByUser1).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: gameId3,
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
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
              score: 4,
            },
            secondPlayerProgress: {
              answers: [
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
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
            id: gameId2,
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
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
              score: 4,
            },
            secondPlayerProgress: {
              answers: [
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
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
            id: gameId1,
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
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
              score: 4,
            },
            secondPlayerProgress: {
              answers: [
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
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
        ],
      });

      const getCurrentAllGamesByUser2: BasePagination<
        QuizGameOutputModel[] | []
      > = await quizGameTestManager.getAllGamesCurrentUser(
        `Bearer ${accessTokenUser2}`,
        {},
        200,
      );

      expect(getCurrentAllGamesByUser2).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: gameId3,
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
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
              score: 4,
            },
            secondPlayerProgress: {
              answers: [
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
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
            id: gameId2,
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
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
              score: 4,
            },
            secondPlayerProgress: {
              answers: [
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
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
            id: gameId1,
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
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Correct,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
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
              score: 4,
            },
            secondPlayerProgress: {
              answers: [
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
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
                {
                  questionId: expect.any(String),
                  answerStatus: QuizCurrentGameAnswerStatusEnum.Incorrect,
                  addedAt: expect.any(String),
                },
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
        ],
      });
    });

    it('Should create and finish 3 games by user 1 and 2, get all games by user 1 and 2 with pagination, pageSize 2, numberPage 1 for first player and numberPage 2 for second player, additional create game with user 3 and 4', async () => {
      await createQuestions();
      const {
        userId1,
        userId2,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

      // Create game for user 3 and 4
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser3}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser4}`,
        200,
      );

      const { gameId: gameId1 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );
      const { gameId: gameId2 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );
      const { gameId: gameId3 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );

      const getCurrentAllGamesByUser1: BasePagination<
        QuizGameOutputModel[] | []
      > = await quizGameTestManager.getAllGamesCurrentUser(
        `Bearer ${accessTokenUser1}`,
        {
          pageSize: 2,
          pageNumber: 1,
        } as QuizGameQuery,
        200,
      );

      expect(getCurrentAllGamesByUser1).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 2,
        totalCount: 3,
        items: [
          {
            id: gameId3,
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
            id: gameId2,
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
        ],
      });

      const getCurrentAllGamesByUser2: BasePagination<
        QuizGameOutputModel[] | []
      > = await quizGameTestManager.getAllGamesCurrentUser(
        `Bearer ${accessTokenUser2}`,
        {
          pageSize: 2,
          pageNumber: 2,
        } as QuizGameQuery,
        200,
      );
      expect(getCurrentAllGamesByUser2).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 2,
        totalCount: 3,
        items: [
          {
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
        ],
      });
    });

    it('Should create game and finish 2 games by user 1 and 2, then start game again, get all games by user 1 with pagination, sort by status ASC for first player and sort by status DESC for second player, additional create game with user 3 and 4', async () => {
      await createQuestions();
      const {
        userId1,
        userId2,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

      // Create game for user 3 and 4
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser3}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser4}`,
        200,
      );

      const { gameId: gameId1 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );
      const { gameId: gameId2 } = await createAndFinishGameWith2Players(
        accessTokenUser1,
        accessTokenUser2,
      );
      // Create game for user 1 and 2 not finished
      const game = await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      const gameId3 = game.id;
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );

      const getCurrentAllGamesByUser1: BasePagination<
        QuizGameOutputModel[] | []
      > = await quizGameTestManager.getAllGamesCurrentUser(
        `Bearer ${accessTokenUser1}`,
        {
          sortBy: 'status',
          sortDirection: 'ASC',
        } as QuizGameQuery,
        200,
      );

      expect(getCurrentAllGamesByUser1).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: gameId3,
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
          },
          {
            id: gameId2,
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
        ],
      });

      const getCurrentAllGamesByUser2: BasePagination<
        QuizGameOutputModel[] | []
      > = await quizGameTestManager.getAllGamesCurrentUser(
        `Bearer ${accessTokenUser2}`,
        {
          sortBy: 'status',
          sortDirection: 'DESC',
        } as QuizGameQuery,
        200,
      );

      expect(getCurrentAllGamesByUser2).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: gameId2,
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
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
              score: 1,
            },
            questions: expect.any(Array),
            status: QuizGameStatusEnum.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
          },
          {
            id: gameId3,
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
          },
        ],
      });
    });
  });

  describe('Get current player statistic', () => {
    it('Should create and finish 4 game, player 1 won 4 times, player 2 losses 4 times and create 5 game and both player lose = draw', async () => {
      await createQuestions();
      const { accessTokenUser1, accessTokenUser2 } = await create2User();
      await createAndFinishGameWith2Players(accessTokenUser1, accessTokenUser2);
      await createAndFinishGameWith2Players(accessTokenUser1, accessTokenUser2);
      await createAndFinishGameWith2Players(accessTokenUser1, accessTokenUser2);
      await createAndFinishGameWith2Players(accessTokenUser1, accessTokenUser2);

      const answerIncorrectBody: QuizGameAnswerQuestionInputModel = {
        answer: gameTestModel.unCorrectAnswerForCurrentQuestion,
      };
      // Create 5 game and answer incorrect for all player
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser1}`,
        200,
      );
      await quizGameTestManager.createOrConnectToGame(
        `Bearer ${accessTokenUser2}`,
        200,
      );
      await Promise.all([
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser1}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerIncorrectBody,
          200,
        ),
        await quizGameTestManager.answerForCurrentGameQuestions(
          `Bearer ${accessTokenUser2}`,
          answerIncorrectBody,
          200,
        ),
      ]);

      /*
      Game: * 4
        * Player 1:
          - 3 correct (Answered - first)
          - 2 incorrect
        * Player 2:
          - 1 correct
          - 4 incorrect
       Game 5:
         * Player 1 and Player 2 all answers was incorrect
      */
      /*
      Correct static for user 1:
            sumScore: 16,
            avgScores: 3.2,
            gamesCount: 5,
            winsCount: 4,
            lossesCount: 0,
            drawsCount: 1,
       */

      /*
      Correct static for user 2:
            sumScore: 4,
            avgScores: 0.8,
            gamesCount: 5,
            winsCount: 0,
            lossesCount: 4,
            drawsCount: 1,
       */
      const getStaticUser1: QuizGameStatisticModel =
        await quizGameTestManager.getStatisticCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );

      expect(getStaticUser1).toEqual({
        sumScore: 16,
        avgScores: 3.2,
        gamesCount: 5,
        winsCount: 4,
        lossesCount: 0,
        drawsCount: 1,
      });

      const getStaticUser2: QuizGameStatisticModel =
        await quizGameTestManager.getStatisticCurrentUser(
          `Bearer ${accessTokenUser2}`,
          200,
        );

      expect(getStaticUser2).toEqual({
        sumScore: 4,
        avgScores: 0.8,
        gamesCount: 5,
        winsCount: 0,
        lossesCount: 4,
        drawsCount: 1,
      });
    });

    it('Should create game with 2 users and finish the games, get current statistic by user 1, user 2 - 401 unauthorized', async () => {
      await createQuestions();
      const { accessTokenUser1, accessTokenUser2 } = await create2User();
      await createAndFinishGameWith2Players(accessTokenUser1, accessTokenUser2);
      /*
        Game:
          * Player 1:
            - 3 correct (Answered - first)
            - 2 incorrect
          * Player 2:
            - 1 correct
            - 4 incorrect
      */
      const getStaticUser1: QuizGameStatisticModel =
        await quizGameTestManager.getStatisticCurrentUser(
          `Bearer ${accessTokenUser1}`,
          200,
        );
      expect(getStaticUser1).toEqual({
        sumScore: 4,
        avgScores: 4,
        gamesCount: 1,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 0,
      });

      await quizGameTestManager.getStatisticCurrentUser(
        `Bearer accessTokenUser2`,
        401,
      );
    });
  });

  describe('Get all players statistics', () => {
    it('Should create and finished 4 games with 4 users. And get statistic all top users without query', async () => {
      await createQuestions();
      const {
        userId1,
        userId2,
        userId3,
        userId4,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );
      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );

      const result: BasePagination<
        QuizGameStatisticWithPlayerInfoModel[] | []
      > = await quizGameTestManager.getTopQuizPlayers({}, 200);
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
     Static:
       all players have 2 game
       user 1: // TOP 2 because user 4 finished last game
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
       user 2: // TOP 4
          - sumScore: 2,
          - avgScores: 1,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 3: // TOP 3
          - sumScore: 6,
          - avgScores: 3,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 4: // TOP 1
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
     */

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId4,
              login: userFourCreateModel.login,
            },
          },
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId1,
              login: userCreateModel.login,
            },
          },
          {
            sumScore: 6,
            avgScores: 3,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId3,
              login: userThreeCreateModel.login,
            },
          },
          {
            sumScore: 2,
            avgScores: 1,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId2,
              login: userTwoCreateModel.login,
            },
          },
        ],
      });
    });

    it('Should create and finished 4 games with 4 users. And get statistic all top users with query, page size 1, page number 2', async () => {
      await createQuestions();
      const {
        userId1,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );
      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );

      const result: BasePagination<
        QuizGameStatisticWithPlayerInfoModel[] | []
      > = await quizGameTestManager.getTopQuizPlayers(
        { pageSize: 1, pageNumber: 2 },
        200,
      );
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
     Static:
       all players have 2 game
       user 1: // TOP 2 because user 4 finished last game
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
       user 2: // TOP 4
          - sumScore: 2,
          - avgScores: 1,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 3: // TOP 3
          - sumScore: 6,
          - avgScores: 3,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 4: // TOP 1
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
     */

      expect(result).toEqual({
        pagesCount: 4,
        page: 2,
        pageSize: 1,
        totalCount: 4,
        items: [
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId1,
              login: userCreateModel.login,
            },
          },
        ],
      });
    });

    it('Should create and finished 4 games with 4 users. And get statistic all top users with query, sort by avg score asc then desc', async () => {
      await createQuestions();
      const {
        userId1,
        userId2,
        userId3,
        userId4,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );
      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );

      const result: BasePagination<
        QuizGameStatisticWithPlayerInfoModel[] | []
      > = await quizGameTestManager.getTopQuizPlayers(
        { sort: 'avgScores asc' },
        200,
      );
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
     Static:
       all players have 2 game
       user 1: // TOP 4 with sort
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
       user 2: // TOP 2 with sort
          - sumScore: 2,
          - avgScores: 1,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 3: // TOP 1 with sort
          - sumScore: 6,
          - avgScores: 3,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 4: // TOP 3 with sort
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
     */

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            sumScore: 2,
            avgScores: 1,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId2,
              login: userTwoCreateModel.login,
            },
          },
          {
            sumScore: 6,
            avgScores: 3,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId3,
              login: userThreeCreateModel.login,
            },
          },
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId4,
              login: userFourCreateModel.login,
            },
          },
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId1,
              login: userCreateModel.login,
            },
          },
        ],
      });
      /*
      Static:
        all players have 2 game
      user 1: // TOP 2 with sort
      - sumScore: 8,
        - avgScores: 4,
        - gamesCount: 2,
        - winsCount: 2,
        - lossesCount: 0,
        - drawsCount: 0,
        user 2: // TOP 3 with sort
      - sumScore: 2,
        - avgScores: 1,
        - gamesCount: 2,
        - winsCount: 0,
        - lossesCount: 2,
        - drawsCount: 0,
        user 3: // TOP 2 with sort
      - sumScore: 6,
        - avgScores: 3,
        - gamesCount: 2,
        - winsCount: 0,
        - lossesCount: 2,
        - drawsCount: 0,
        user 4: // TOP 1 with sort
      - sumScore: 8,
        - avgScores: 4,
        - gamesCount: 2,
        - winsCount: 2,
        - lossesCount: 0,
        - drawsCount: 0,
    */
      const resultByDesc: BasePagination<
        QuizGameStatisticWithPlayerInfoModel[] | []
      > = await quizGameTestManager.getTopQuizPlayers(
        { sort: 'avgScores desc' },
        200,
      );

      expect(resultByDesc).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId4,
              login: userFourCreateModel.login,
            },
          },
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId1,
              login: userCreateModel.login,
            },
          },
          {
            sumScore: 6,
            avgScores: 3,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId3,
              login: userThreeCreateModel.login,
            },
          },
          {
            sumScore: 2,
            avgScores: 1,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId2,
              login: userTwoCreateModel.login,
            },
          },
        ],
      });
    });

    it('Should create and finished 4 games with 4 users. And get statistic all top users with query, sort by 2 params game count asc and sort by loses count desc', async () => {
      await createQuestions();
      const {
        userId1,
        userId2,
        userId3,
        userId4,
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      } = await create4User();

      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );
      await createAndFinishGameWith4Players(
        accessTokenUser1,
        accessTokenUser2,
        accessTokenUser3,
        accessTokenUser4,
      );

      const result: BasePagination<
        QuizGameStatisticWithPlayerInfoModel[] | []
      > = await quizGameTestManager.getTopQuizPlayers(
        { sort: ['lossesCount desc', 'gamesCount asc'] },
        200,
      );
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
     Static:
       all players have 2 game
       user 1: // TOP 4 with sort
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
       user 2: // TOP 1 with sort
          - sumScore: 2,
          - avgScores: 1,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 3: // TOP 2 with sort
          - sumScore: 6,
          - avgScores: 3,
          - gamesCount: 2,
          - winsCount: 0,
          - lossesCount: 2,
          - drawsCount: 0,
       user 4: // TOP 3 with sort
          - sumScore: 8,
          - avgScores: 4,
          - gamesCount: 2,
          - winsCount: 2,
          - lossesCount: 0,
          - drawsCount: 0,
     */

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            sumScore: 2,
            avgScores: 1,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId2,
              login: userTwoCreateModel.login,
            },
          },
          {
            sumScore: 6,
            avgScores: 3,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 2,
            drawsCount: 0,
            player: {
              id: userId3,
              login: userThreeCreateModel.login,
            },
          },
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId4,
              login: userFourCreateModel.login,
            },
          },
          {
            sumScore: 8,
            avgScores: 4,
            gamesCount: 2,
            winsCount: 2,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: userId1,
              login: userCreateModel.login,
            },
          },
        ],
      });
    });
  });
});
