import { QuizGameStatusEnum } from '../../../domain/types';
import { QuizCurrentGameAnswerStatusEnum } from '../../../../game-answer/domain/types';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../../../domain/quiz-game.entity';
import { GamePlayers } from '../../../../game-player/domain/game-players.entity';
import { GameQuestions } from '../../../../game-questions/domain/game-questions.entity';
import { GamPlayerAnswerOutputModel } from '../../../../game-answer/api/model/output/gam-player-answer-output.model';
import { GameUserAnswer } from '../../../../game-answer/domain/game-user-answer.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';

export class QuizGameStatisticModel {
  @ApiProperty({
    description: 'Sum scores of all games',
    example: '1',
    type: Number,
  })
  sumScore: number;
  @ApiProperty({
    description: 'Average score of all games rounded to 2 decimal places',
    example: '1',
    type: Number,
  })
  avgScores: number;
  @ApiProperty({
    description: 'All played games count',
    example: '1',
    type: Number,
  })
  gamesCount: number;
  @ApiProperty({
    description: 'All won games count',
    example: '1',
    type: Number,
  })
  winsCount: number;
  @ApiProperty({
    description: 'All lose games count',
    example: '1',
    type: Number,
  })
  lossesCount: number;
  @ApiProperty({
    description: 'All draw games count',
    example: '1',
    type: Number,
  })
  drawsCount: number;
}

export class QuizGameCurrentQuestionsModel {
  @ApiProperty({
    description: 'Question`s id',
    example: '1',
    type: String,
  })
  id: string;
  @ApiProperty({
    description: 'Question`s body',
    example: '1',
    type: String,
  })
  body: string;
}

export class QuizGamePlayerInfoModel {
  @ApiProperty({
    description: 'Player`s id',
    example: '1',
    type: String,
  })
  id: string;
  @ApiProperty({
    description: 'User login',
    example: 'login',
    type: String,
  })
  login: string;
}

export class QuizGamePlayerProgressModel {
  @ApiProperty({
    description: 'Player`s answers for current game or empty array',
    type: GamPlayerAnswerOutputModel,
  })
  answers: GamPlayerAnswerOutputModel[];
  @ApiProperty({
    description: 'Info about player',
    type: QuizGamePlayerInfoModel,
  })
  player: QuizGamePlayerInfoModel;
  @ApiProperty({
    description: 'The score of this player',
    example: '4',
    type: String,
  })
  score: number;
}

export class QuizGameOutputModel {
  @ApiProperty({
    description: 'Game`s id',
    example: '4',
    type: String,
  })
  id: string;
  @ApiProperty({
    description: 'Info about first player',
    type: QuizGamePlayerProgressModel,
  })
  firstPlayerProgress: QuizGamePlayerProgressModel;
  @ApiProperty({
    description: 'Info about second player',
    type: QuizGamePlayerProgressModel,
    nullable: true,
  })
  secondPlayerProgress: QuizGamePlayerProgressModel;
  @ApiProperty({
    description: 'Questions for current game',
    type: QuizGameCurrentQuestionsModel,
    nullable: true,
  })
  questions: QuizGameCurrentQuestionsModel[];
  @ApiProperty({
    description: 'Status current game',
    example: QuizGameStatusEnum.Active,
    enum: QuizGameStatusEnum,
  })
  status: QuizGameStatusEnum;
  @ApiProperty({
    description: 'The date when game was create',
    example: '2023-01-01T00:00:00Z',
    type: String,
  })
  pairCreatedDate: string;
  @ApiProperty({
    description: 'The date when game was start (Second player connect to game)',
    example: '2023-01-01T00:00:00Z',
    nullable: true,
    type: String,
  })
  startGameDate: string;
  @ApiProperty({
    description: 'The date when game was finish',
    example: '2023-01-01T00:00:00Z',
    nullable: true,
    type: String,
  })
  finishGameDate: string;
}

export class QuizGameAnswerResult {
  @ApiProperty({
    description: 'Question id',
    example: '1',
    type: String,
  })
  questionId: string;
  @ApiProperty({
    description: 'Answer status',
    enum: QuizCurrentGameAnswerStatusEnum,
    type: QuizCurrentGameAnswerStatusEnum,
  })
  answerStatus: QuizCurrentGameAnswerStatusEnum;
  @ApiProperty({
    description: 'The date when answer was create',
    example: '2023-01-01T00:00:00Z',
    type: String,
  })
  addedAt: string;
}

@Injectable()
export class QuizGameMapperOutputModel {
  mapQuizGame(game: QuizGame): QuizGameOutputModel {
    const firstPlayer: GamePlayers = game.gamePlayers.find(
      (p: GamePlayers): boolean => p.playerNumber === 1,
    );
    const secondPlayer: GamePlayers | null = game.gamePlayers.find(
      (p: GamePlayers): boolean => p.playerNumber === 2,
    );

    let firstPlayerScore: number = 0;
    if (game.status === QuizGameStatusEnum.Finished)
      firstPlayer.isFirst ? ++firstPlayerScore : +0;

    const playerFirstAnswers = firstPlayer.player.playerAnswers.map(
      (answer: GameUserAnswer) => {
        const question: GameQuestions = game.gameQuestions.find(
          (question: GameQuestions): boolean =>
            question.id === answer.gameQuestionId,
        );
        answer.isTrue ? ++firstPlayerScore : +0;
        return {
          questionId: question.questionId.toString(),
          answerStatus: answer.isTrue
            ? QuizCurrentGameAnswerStatusEnum.Correct
            : QuizCurrentGameAnswerStatusEnum.Incorrect,
          addedAt: answer.createdAt.toISOString(),
        };
      },
    );

    let secondPlayerScore: number = 0;
    if (game.status === QuizGameStatusEnum.Finished)
      secondPlayer.isFirst ? ++secondPlayerScore : +0;

    const playerSecondAnswers = secondPlayer
      ? secondPlayer.player.playerAnswers.map((answer: GameUserAnswer) => {
          const question: GameQuestions = game.gameQuestions.find(
            (question: GameQuestions): boolean =>
              question.id === answer.gameQuestionId,
          );

          answer.isTrue ? ++secondPlayerScore : +0;
          return {
            questionId: question.questionId.toString(),
            answerStatus: answer.isTrue
              ? QuizCurrentGameAnswerStatusEnum.Correct
              : QuizCurrentGameAnswerStatusEnum.Incorrect,
            addedAt: answer.createdAt.toISOString(),
          };
        })
      : null;

    return {
      id: game.id.toString(),
      firstPlayerProgress: {
        player: {
          id: firstPlayer.playerId.toString(),
          login: firstPlayer.player.user.login,
        },
        answers: playerFirstAnswers,
        score: firstPlayerScore,
      },
      secondPlayerProgress: secondPlayer
        ? {
            player: {
              id: secondPlayer.playerId.toString(),
              login: secondPlayer.player.user.login,
            },
            answers: playerSecondAnswers,
            score: secondPlayerScore,
          }
        : null,
      questions:
        game.status === QuizGameStatusEnum.PendingSecondPlayer
          ? null
          : game.gameQuestions.map(
              (question: GameQuestions): QuizGameCurrentQuestionsModel => {
                return {
                  id: question.question.id.toString(),
                  body: question.question.body,
                };
              },
            ),
      status: game.status,
      pairCreatedDate: game.pairCreatedDate.toISOString(),
      startGameDate: game.startGameDate?.toISOString() ?? null,
      finishGameDate: game.finishGameDate?.toISOString() ?? null,
    };
  }

  mapQuizGames(games: QuizGame[]): QuizGameOutputModel[] {
    return games.map((game: QuizGame) => this.mapQuizGame(game));
  }
}

export class QuizGameOutputModelForSwagger extends BasePagination<QuizGameOutputModel> {
  @ApiProperty({
    description: 'The all current player games',
    isArray: true,
    type: QuizGameOutputModel,
  })
  items: QuizGameOutputModel;
}
