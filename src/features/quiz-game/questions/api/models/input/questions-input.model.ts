import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { validationRules } from '../../../../../../core/utils/validation-rules/validation-rules';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsStringArray } from '../../../../../../core/decorators/validation/string-array';
import { BaseSorting } from '../../../../../../base/sorting/base-sorting';
import { QuizQuestionPublishedPropertyEnum } from '../../../domain/types';
import { Injectable } from '@nestjs/common';

export class QuestionsInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.quizGameQuestionBody.MIN_LENGTH,
    validationRules.quizGameQuestionBody.MAX_LENGTH,
  )
  body: string;
  @Trim()
  @IsNotEmpty()
  @IsStringArray()
  correctAnswers: string[];
}

export class QuestionsUpdateInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.quizGameQuestionBody.MIN_LENGTH,
    validationRules.quizGameQuestionBody.MAX_LENGTH,
  )
  body: string;
  @Trim()
  @IsNotEmpty()
  @IsStringArray()
  correctAnswers: string[];
}

export class QuestionsPublishInputModel {
  @Trim()
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}

@Injectable()
export class QuestionQuery extends BaseSorting {
  public readonly bodySearchTerm: string;
  @IsOptional()
  @IsEnum(QuizQuestionPublishedPropertyEnum)
  public readonly publishedStatus?: QuizQuestionPublishedPropertyEnum;

  constructor() {
    super();
  }

  public createQuestionQuery(query: QuestionQuery) {
    const baseQuery = this.createBaseQuery(query);
    return {
      ...baseQuery,
      bodySearchTerm: query?.bodySearchTerm ?? '',
      publishedStatus:
        query?.publishedStatus ?? QuizQuestionPublishedPropertyEnum.all,
    };
  }
}
