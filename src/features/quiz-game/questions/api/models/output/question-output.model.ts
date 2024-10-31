import { QuizQuestions } from '../../../domain/questions.entity';
import { QuizQuestionAnswer } from '../../../../question-answer/domain/question-answer.entity';
import { Injectable } from '@nestjs/common';

export class QuestionOutputModel {
  public id: string;
  public body: string;
  public correctAnswers: string[];
  public published: boolean;
  public createdAt: string;
  public updatedAt: string;
}

@Injectable()
export class QuestionMapperOutputModel {
  constructor() {}
  questionModel(question: QuizQuestions): QuestionOutputModel {
    return {
      id: question.id.toString(),
      body: question.body,
      correctAnswers: question.answers.map((a: QuizQuestionAnswer) => a.body),
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }

  questionsModel(questions: QuizQuestions[]): QuestionOutputModel[] {
    return questions.map((question: QuizQuestions) => {
      return {
        id: question.id.toString(),
        body: question.body,
        correctAnswers: question.answers.map((a: QuizQuestionAnswer) => a.body),
        published: question.published,
        createdAt: question.createdAt.toISOString(),
        updatedAt: question.updatedAt.toISOString(),
      };
    });
  }
}
