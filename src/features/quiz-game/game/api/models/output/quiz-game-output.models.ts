import { QuizGameStatusEnum } from '../../../domain/types';
import { QuizCurrentGameAnswerStatusEnum } from '../../../../game-answer/domain/types';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../../../domain/quiz-game.entity';
import { GamePlayers } from '../../../../game-player/domain/game-players.entity';
import { GameQuestions } from '../../../../game-questions/domain/game-questions.entity';
import { GamPlayerAnswerOutputModel } from '../../../../game-answer/api/model/output/gam-player-answer-output.model';

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
  mapQuizGame(game: QuizGame, currentUserId: number): QuizGameOutputModel {
    const firstPlayer: GamePlayers = game.gamePlayers.find(
      (p: GamePlayers): boolean => p.playerNumber === 1,
    );
    const secondPlayer: GamePlayers | null = game.gamePlayers.find(
      (p: GamePlayers): boolean => p.playerNumber === 2,
    );

    const currentPlayer: GamePlayers =
      firstPlayer.player.userId === currentUserId ? firstPlayer : secondPlayer;

    const currentPlayerAnswers = currentPlayer.player.userAnswers;

    let questionPosition = 1;
    switch (currentPlayerAnswers.length) {
      case 0:
        break;
      case 1:
        questionPosition = 2;
        break;
      case 2:
        questionPosition = 3;
        break;
      case 3:
        questionPosition = 4;
        break;
      case 4:
        questionPosition = 5;
        break;
      default:
        questionPosition = 1;
    }

    let firstPlayerScore: number = 0;
    const playerFirstAnswers = firstPlayer.player.userAnswers.map((answer) => {
      const question: GameQuestions = game.gameQuestions.find(
        (question: GameQuestions): boolean => question.id <= answer.questionId,
      );
      if (game.status === QuizGameStatusEnum.Finished)
        answer.isFirst ? ++firstPlayerScore : +0;

      answer.isTrue ? ++firstPlayerScore : +0;
      return {
        questionId: question.questionId.toString(),
        answerStatus: answer.isTrue
          ? QuizCurrentGameAnswerStatusEnum.Correct
          : QuizCurrentGameAnswerStatusEnum.Incorrect,
        addedAt: answer.createdAt.toISOString(),
      };
    });

    let secondPlayerScore: number = 0;
    const playerSecondAnswers = secondPlayer
      ? secondPlayer.player.userAnswers.map((answer) => {
          const question: GameQuestions = game.gameQuestions.find(
            (question: GameQuestions): boolean =>
              question.id <= answer.questionId,
          );
          if (game.status === QuizGameStatusEnum.Finished)
            answer.isFirst ? ++secondPlayerScore : +0;
          answer.isTrue ? ++secondPlayerScore : +0;
          return {
            questionId: question.questionId.toString(),
            answerStatus: answer.isTrue
              ? QuizCurrentGameAnswerStatusEnum.Correct
              : QuizCurrentGameAnswerStatusEnum.Incorrect,
            addedAt: answer.createdAt.toISOString(),
          };
        })
      : [];
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
          ? []
          : game.gameQuestions
              .filter(
                (question: GameQuestions) =>
                  question.position <= questionPosition,
              )
              .map((question: GameQuestions): QuizGameCurrentQuestionsModel => {
                return {
                  id: question.question.id.toString(),
                  body: question.question.body,
                };
              }),
      status: game.status,
      pairCreatedDate: game.createdAt.toISOString(),
      startGameDate: game.startGameAt?.toISOString() || null,
      finishGameDate: game.finishGameAt?.toISOString() || null,
    };
  }
}
