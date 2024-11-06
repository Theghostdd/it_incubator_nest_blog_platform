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
import { ApiProperty } from '@nestjs/swagger';

export class QuestionsInputModel {
  @ApiProperty({
    description: 'Question body',
    example: 'This is question',
    type: String,
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.quizGameQuestionBody.MIN_LENGTH,
    validationRules.quizGameQuestionBody.MAX_LENGTH,
  )
  body: string;
  @ApiProperty({
    description: 'The answers for question',
    example: ['Answer 1', 'Answer 2', 'Answer 3'],
    type: Array,
  })
  @Trim()
  @IsNotEmpty()
  @IsStringArray()
  correctAnswers: string[];
}

export class QuestionsUpdateInputModel {
  @ApiProperty({
    description: 'Question body',
    example: 'This is question',
    type: String,
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.quizGameQuestionBody.MIN_LENGTH,
    validationRules.quizGameQuestionBody.MAX_LENGTH,
  )
  body: string;
  @ApiProperty({
    description: 'The answers for question',
    example: ['Answer 1', 'Answer 2', 'Answer 3'],
    type: Array,
  })
  @Trim()
  @IsNotEmpty()
  @IsStringArray()
  correctAnswers: string[];
}

export class QuestionsPublishInputModel {
  @ApiProperty({
    description: 'The publish status',
    example: true,
    type: Boolean,
  })
  @Trim()
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}

@Injectable()
export class QuestionQuery extends BaseSorting {
  @ApiProperty({
    description: 'Find question by body',
    example: 'How many?',
    required: false,
    type: String,
  })
  public readonly bodySearchTerm: string;
  @ApiProperty({
    description: 'Question`s status',
    enum: QuizQuestionPublishedPropertyEnum,
    required: false,
    type: QuizQuestionPublishedPropertyEnum,
  })
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
