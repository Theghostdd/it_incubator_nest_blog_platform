import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import request from 'supertest';
import {
  QuestionQuery,
  QuestionsInputModel,
  QuestionsPublishInputModel,
  QuestionsUpdateInputModel,
} from '../../../src/features/quiz-game/questions/api/models/input/questions-input.model';

export class QuizGameTestManager {
  private readonly apiPrefix: string;
  private readonly quizGameQuestionEndpoint: string;
  private readonly quizGameQuestionPublishEndpoint: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.quizGameQuestionEndpoint = `${this.apiPrefix}/${apiPrefixSettings.QUIZ_GAME.sa.game_question}`;
    this.quizGameQuestionPublishEndpoint = `${apiPrefixSettings.QUIZ_GAME.sa.publish}`;
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
}
