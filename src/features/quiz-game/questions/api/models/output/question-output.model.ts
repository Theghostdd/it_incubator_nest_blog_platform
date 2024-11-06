import { QuizQuestions } from '../../../domain/questions.entity';
import { QuizQuestionAnswer } from '../../../../question-answer/domain/question-answer.entity';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';

export class QuestionOutputModel {
  @ApiProperty({
    description: 'Question`s id',
    example: '1',
    type: String,
  })
  public id: string;
  @ApiProperty({
    description: 'Question`s body',
    example: 'This is question',
    type: String,
  })
  public body: string;
  @ApiProperty({
    description: 'Question`s answers',
    example: [
      'This is question answer 1',
      'This is question answer 2',
      'This is question answer 3',
    ],
    type: Array,
  })
  public correctAnswers: string[];
  @ApiProperty({
    description: 'Question`s publish status',
    example: true,
    type: Boolean,
  })
  public published: boolean;
  @ApiProperty({
    description: 'The date when question was create',
    example: '2023-01-01T00:00:00Z',
    type: String,
  })
  public createdAt: string;
  @ApiProperty({
    description: 'The date when question was update',
    example: '2023-01-01T00:00:00Z',
    type: String,
    nullable: true,
  })
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
      updatedAt: question.updatedAt?.toISOString() ?? null,
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
        updatedAt: question.updatedAt?.toISOString() ?? null,
      };
    });
  }
}

export class QuestionOutputModelForSwagger extends BasePagination<QuestionOutputModel> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: QuestionOutputModel,
  })
  items: QuestionOutputModel;
}
