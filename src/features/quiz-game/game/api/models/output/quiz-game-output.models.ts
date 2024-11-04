import { QuizGameStatusEnum } from '../../../domain/types';
import { QuizCurrentGameAnswerStatusEnum } from '../../../../game-answer/domain/types';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../../../domain/quiz-game.entity';
import { GamePlayers } from '../../../../game-player/domain/game-players.entity';
import { GameQuestions } from '../../../../game-questions/domain/game-questions.entity';
import { GamPlayerAnswerOutputModel } from '../../../../game-answer/api/model/output/gam-player-answer-output.model';
import { GameUserAnswer } from '../../../../game-answer/domain/game-user-answer.entity';

export class QuizGameCurrentQuestionsModel {
  id: string;
  body: string;
}

export class QuizGamePlayerInfoModel {
  id: string;
  login: string;
}

export class QuizGamePlayerProgressModel {
  answers: GamPlayerAnswerOutputModel[];
  player: QuizGamePlayerInfoModel;
  score: number;
}

export class QuizGameOutputModel {
  id: string;
  firstPlayerProgress: QuizGamePlayerProgressModel;
  secondPlayerProgress: QuizGamePlayerProgressModel;
  questions: QuizGameCurrentQuestionsModel[];
  status: QuizGameStatusEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
}

export class QuizGameAnswerResult {
  questionId: string;
  answerStatus: QuizCurrentGameAnswerStatusEnum;
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
      pairCreatedDate: game.createdAt.toISOString(),
      startGameDate: game.startGameAt?.toISOString() ?? null,
      finishGameDate: game.finishGameAt?.toISOString() ?? null,
    };
  }
}
