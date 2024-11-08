import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import request from 'supertest';
import {
  QuestionQuery,
  QuestionsInputModel,
  QuestionsPublishInputModel,
  QuestionsUpdateInputModel,
} from '../../../src/features/quiz-game/questions/api/models/input/questions-input.model';
import {
  QuizGameAnswerQuestionInputModel,
  QuizGameQuery,
} from '../../../src/features/quiz-game/game/api/models/input/quiz-game-input.model';

export class QuizGameTestManager {
  private readonly apiPrefix: string;
  private readonly quizGameQuestionEndpoint: string;
  private readonly quizGameQuestionPublishEndpoint: string;
  private readonly pairGameQuiz: string;
  private readonly pairGameQuizPairs: string;
  private readonly pairGameQuizPairsConnection: string;
  private readonly pairGameQuizPairsMyCurrent: string;
  private readonly pairGameQuizPairsMyCurrentAnswer: string;
  private readonly pairGameQuizPairsMy: string;
  private readonly pairGameQuizPairsUsers: string;
  private readonly pairGameQuizPairsMyStatistic: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.quizGameQuestionEndpoint = `${this.apiPrefix}/${apiPrefixSettings.QUIZ_GAME.sa.game_question}`;
    this.quizGameQuestionPublishEndpoint = `${apiPrefixSettings.QUIZ_GAME.sa.publish}`;
    this.pairGameQuiz = `${this.apiPrefix}/${apiPrefixSettings.QUIZ_GAME.public.pair_game_quiz}`;
    this.pairGameQuizPairs = `${this.pairGameQuiz}/${apiPrefixSettings.QUIZ_GAME.public.pairs}`;
    this.pairGameQuizPairsConnection = `${this.pairGameQuizPairs}/${apiPrefixSettings.QUIZ_GAME.public.connection}`;
    this.pairGameQuizPairsMyCurrent = `${this.pairGameQuizPairs}/${apiPrefixSettings.QUIZ_GAME.public.my_current}`;
    this.pairGameQuizPairsMyCurrentAnswer = `${this.pairGameQuizPairs}/${apiPrefixSettings.QUIZ_GAME.public.my_current}/${apiPrefixSettings.QUIZ_GAME.public.answers}`;
    this.pairGameQuizPairsMy = `${this.pairGameQuizPairs}/${apiPrefixSettings.QUIZ_GAME.public.my}`;
    this.pairGameQuizPairsUsers = `${this.pairGameQuiz}/${apiPrefixSettings.QUIZ_GAME.public.users}`;
    this.pairGameQuizPairsMyStatistic = `${this.pairGameQuizPairsUsers}/${apiPrefixSettings.QUIZ_GAME.public.my_statistic}`;
  }
  async createQuestion(
    authorizationToken: string,
    questionsInputModel: QuestionsInputModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.quizGameQuestionEndpoint}`)
      .set({ authorization: authorizationToken })
      .send(questionsInputModel)
      .expect(statusCode);
    return result.body;
  }

  async deleteQuestion(
    authorizationToken: string,
    id: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.quizGameQuestionEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async getAllQuestions(
    authorizationToken: string,
    query: QuestionQuery | null,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.quizGameQuestionEndpoint}`)
      .query(query)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async publishQuestionById(
    authorizationToken: string,
    id: string,
    inputModel: QuestionsPublishInputModel | { published: string },
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(
        `${this.quizGameQuestionEndpoint}/${id}/${this.quizGameQuestionPublishEndpoint}`,
      )
      .set({ authorization: authorizationToken })
      .send(inputModel)
      .expect(statusCode);
    return result.body;
  }

  async updateQuestionById(
    authorizationToken: string,
    id: string,
    updateModel: QuestionsUpdateInputModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`${this.quizGameQuestionEndpoint}/${id}`)
      .set({ authorization: authorizationToken })
      .send(updateModel)
      .expect(statusCode);
    return result.body;
  }

  async createOrConnectToGame(authorizationToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.pairGameQuizPairsConnection}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async getGameByID(
    authorizationToken: string,
    gameId: string | number,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.pairGameQuizPairs}/${gameId}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async getGameCurrentUser(authorizationToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.pairGameQuizPairsMyCurrent}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }

  async answerForCurrentGameQuestions(
    authorizationToken: string,
    inputModel: QuizGameAnswerQuestionInputModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.pairGameQuizPairsMyCurrentAnswer}`)
      .set({ authorization: authorizationToken })
      .send(inputModel)
      .expect(statusCode);
    return result.body;
  }

  async getAllGamesCurrentUser(
    authorizationToken: string,
    query: QuizGameQuery | {},
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.pairGameQuizPairsMy}`)
      .set({ authorization: authorizationToken })
      .query(query)
      .expect(statusCode);
    return result.body;
  }

  async getStatisticCurrentUser(
    authorizationToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.pairGameQuizPairsMyStatistic}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }
}
