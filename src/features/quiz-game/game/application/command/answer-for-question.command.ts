import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { QuizGameAnswerQuestionInputModel } from '../../api/models/input/quiz-game-input.model';
import { QuizGameRepositories } from '../../infrastructure/quiz-game-repositories';
import { QuizGame } from '../../domain/quiz-game.entity';
import { Player } from '../../../player/domain/quiz-game-player.entity';
import { QuizGameStatusEnum } from '../../domain/types';
import { GameUserAnswer } from '../../../game-answer/domain/game-user-answer.entity';
import { Inject } from '@nestjs/common';
import { GamePlayers } from '../../../game-player/domain/game-players.entity';
import { PlayerRepository } from '../../../player/infrastructure/player-repositories';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

export class AnswerForQuestionCommand {
  constructor(
    public inputModel: QuizGameAnswerQuestionInputModel,
    public userId: number,
  ) {}
}

// @CommandHandler(AnswerForQuestionCommand)
// export class AnswerForQuestionHandler
//   implements ICommandHandler<AnswerForQuestionCommand, AppResultType<number>>
// {
//   constructor(
//     private readonly applicationObjectResult: ApplicationObjectResult,
//     private readonly quizGameRepositories: QuizGameRepositories,
//     @Inject(GameUserAnswer.name)
//     private readonly gameUserAnswer: typeof GameUserAnswer,
//     private readonly gamePlayerAnswerRepositories: GamePlayerAnswerRepositories,
//     private readonly playerRepository: PlayerRepository,
//   ) {}
//   async execute(
//     command: AnswerForQuestionCommand,
//   ): Promise<AppResultType<number>> {
//     const { answer: playerAnswer } = command.inputModel;
//     const { userId } = command;
//
//     const player: Player =
//       await this.playerRepository.getPlayerByUserId(userId);
//
//     const currentPlayerGame: QuizGame | null =
//       await this.quizGameRepositories.getCurrentPlayerGame(player.id);
//
//     if (!currentPlayerGame) return this.applicationObjectResult.forbidden();
//     if (
//       currentPlayerGame.status === QuizGameStatusEnum.Finished ||
//       currentPlayerGame.status === QuizGameStatusEnum.PendingSecondPlayer
//     )
//       return this.applicationObjectResult.forbidden();
//
//     const game: QuizGame =
//       await this.quizGameRepositories.getCurrentPlayerGameByIdWithAnswers(
//         currentPlayerGame.id,
//       );
//
//     const currentPlayerAnswers: GameUserAnswer[] = game.gamePlayers.find(
//       (p: GamePlayers): boolean => p.playerId === player.id,
//     ).player.playerAnswers;
//
//     if (currentPlayerAnswers.length === 5)
//       return this.applicationObjectResult.forbidden();
//
//     const secondPlayerAnswers: GameUserAnswer[] = game.gamePlayers.find(
//       (p: GamePlayers): boolean => p.playerId !== player.id,
//     ).player.playerAnswers;
//
//     const answer: GameUserAnswer = this.gameUserAnswer.createAnswer(
//       playerAnswer,
//       currentPlayerAnswers,
//       secondPlayerAnswers,
//       game.gameQuestions,
//       player,
//     );
//
//     let result: number;
//     if (
//       currentPlayerAnswers.length + 1 === 5 &&
//       secondPlayerAnswers.length === 5
//     ) {
//       game.finishGame();
//       result = await this.quizGameRepositories.saveLastAnswerAndFinishGame(
//         game,
//         answer,
//       );
//     } else {
//       result = await this.gamePlayerAnswerRepositories.save(answer);
//     }
//
//     return this.applicationObjectResult.success(result);
//   }
// }

@CommandHandler(AnswerForQuestionCommand)
export class AnswerForQuestionHandler
  implements ICommandHandler<AnswerForQuestionCommand, AppResultType<number>>
{
  constructor(
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly quizGameRepositories: QuizGameRepositories,
    @Inject(GameUserAnswer.name)
    private readonly gameUserAnswer: typeof GameUserAnswer,
    private readonly playerRepository: PlayerRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(QuizGame)
    private readonly quizGameRepository: Repository<QuizGame>,
  ) {}
  async execute(
    command: AnswerForQuestionCommand,
  ): Promise<AppResultType<number>> {
    const { answer: playerAnswer } = command.inputModel;
    const { userId } = command;

    const player: Player =
      await this.playerRepository.getPlayerByUserId(userId);
    const playerId: number = player.id;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const currentPlayerGame: QuizGame | null =
        await queryRunner.manager.findOne(this.quizGameRepository.target, {
          where: [
            { status: QuizGameStatusEnum.Active, gamePlayers: { playerId } },
            {
              status: QuizGameStatusEnum.PendingSecondPlayer,
              gamePlayers: { playerId },
            },
          ],
          lock: { mode: 'pessimistic_write' },
        });

      if (!currentPlayerGame) return this.applicationObjectResult.forbidden();
      if (
        currentPlayerGame.status === QuizGameStatusEnum.Finished ||
        currentPlayerGame.status === QuizGameStatusEnum.PendingSecondPlayer
      )
        return this.applicationObjectResult.forbidden();

      const game: QuizGame =
        await this.quizGameRepositories.getCurrentPlayerGameByIdWithAnswers(
          currentPlayerGame.id,
        );

      const currentPlayerAnswers: GameUserAnswer[] = game.gamePlayers.find(
        (p: GamePlayers): boolean => p.playerId === player.id,
      ).player.playerAnswers;

      if (currentPlayerAnswers.length === 5)
        return this.applicationObjectResult.forbidden();

      const secondPlayerAnswers: GameUserAnswer[] = game.gamePlayers.find(
        (p: GamePlayers): boolean => p.playerId !== player.id,
      ).player.playerAnswers;

      const answer: GameUserAnswer = this.gameUserAnswer.createAnswer(
        playerAnswer,
        currentPlayerAnswers,
        game.gameQuestions,
        player,
      );

      if (
        currentPlayerAnswers.length + 1 === 5 &&
        secondPlayerAnswers.length === 5
      ) {
        game.finishGame();
        await queryRunner.manager.save(game);
      }

      if (
        currentPlayerAnswers.length + 1 === 5 &&
        secondPlayerAnswers.length < 5
      ) {
        const curPlayer: GamePlayers = game.gamePlayers.find(
          (p) => p.playerId === player.id,
        );
        curPlayer.setFirst();
        await queryRunner.manager.save(curPlayer);
      }

      const result: GameUserAnswer = await queryRunner.manager.save(answer);
      await queryRunner.commitTransaction();
      return this.applicationObjectResult.success(result.id);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return e;
    } finally {
      await queryRunner.release();
    }
  }
}
