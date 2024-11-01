import { Injectable } from '@nestjs/common';
import { GameUserAnswer } from '../../../domain/game-user-answer.entity';
import { QuizCurrentGameAnswerStatusEnum } from '../../../domain/types';

export class GamPlayerAnswerOutputModel {
  questionId: string;
  answerStatus: QuizCurrentGameAnswerStatusEnum;
  addedAt: string;
}

@Injectable()
export class GamPlayerAnswerOutputModelMapper {
  mapAnswer(answer: GameUserAnswer): GamPlayerAnswerOutputModel {
    return {
      questionId: answer.question.questionId.toString(),
      answerStatus: answer.isTrue
        ? QuizCurrentGameAnswerStatusEnum.Correct
        : QuizCurrentGameAnswerStatusEnum.Incorrect,
      addedAt: answer.createdAt.toISOString(),
    };
  }
}
