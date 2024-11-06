import { Injectable } from '@nestjs/common';
import { GameUserAnswer } from '../../../domain/game-user-answer.entity';
import { QuizCurrentGameAnswerStatusEnum } from '../../../domain/types';
import { ApiProperty } from '@nestjs/swagger';

export class GamPlayerAnswerOutputModel {
  @ApiProperty({
    description: 'Question`s id',
    example: '1',
    type: String,
  })
  questionId: string;
  @ApiProperty({
    description: 'Correct or incorrect answer',
    enum: QuizCurrentGameAnswerStatusEnum,
    type: QuizCurrentGameAnswerStatusEnum,
  })
  answerStatus: QuizCurrentGameAnswerStatusEnum;
  @ApiProperty({
    description: 'The date when the answer was add',
    example: '2023-01-01T00:00:00Z',
    type: String,
  })
  addedAt: string;
}

@Injectable()
export class GamPlayerAnswerOutputModelMapper {
  mapAnswer(answer: GameUserAnswer): GamPlayerAnswerOutputModel {
    return {
      questionId: answer.gameQuestion.questionId.toString(),
      answerStatus: answer.isTrue
        ? QuizCurrentGameAnswerStatusEnum.Correct
        : QuizCurrentGameAnswerStatusEnum.Incorrect,
      addedAt: answer.createdAt.toISOString(),
    };
  }
}
