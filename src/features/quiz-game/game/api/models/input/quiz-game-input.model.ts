import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { BaseSorting } from '../../../../../../base/sorting/base-sorting';
import { QuizGamePropertyEnum } from '../../../domain/types';

export class QuizGameAnswerQuestionInputModel {
  @ApiProperty({
    description: 'Answer`s body',
    example: 'This is answer for question',
    type: String,
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  answer: string;
}

@Injectable()
export class QuizGameQuery extends BaseSorting {
  private sortByParamsQuizGame: string[] = [
    'pairCreatedDate',
    'startGameDate',
    'finishGameDate',
    'status',
  ];
  createQuery(query: BaseSorting) {
    const modifyQuery = {
      ...query,
      sortBy: this.sortByParamsQuizGame.includes(query.sortBy)
        ? query.sortBy
        : QuizGamePropertyEnum.pairCreatedDate,
    };
    const baseQuery = this.createBaseQuery(modifyQuery as BaseSorting);
    return {
      ...baseQuery,
      sortBy: query?.sortBy
        ? baseQuery.sortBy
        : QuizGamePropertyEnum.pairCreatedDate,
    };
  }
}
