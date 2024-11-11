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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

export class AnswerForQuestionCommand {
  constructor(
    public inputModel: QuizGameAnswerQuestionInputModel,
    public userId: number,
  ) {}
}

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
        await this.quizGameRepositories.getCurrentGame(playerId, queryRunner);

      if (!this.isGameValid(currentPlayerGame))
        return this.applicationObjectResult.forbidden();

      const game: QuizGame =
        await this.quizGameRepositories.getCurrentPlayerGameByIdWithAnswers(
          currentPlayerGame.id,
          queryRunner,
        );

      const currentPlayerAnswers: GameUserAnswer[] | [] = game.gamePlayers.find(
        (p: GamePlayers): boolean => p.playerId === playerId,
      ).player.playerAnswers;

      if (currentPlayerAnswers.length === 5)
        return this.applicationObjectResult.forbidden();

      const answer: GameUserAnswer = this.gameUserAnswer.createAnswer(
        playerAnswer,
        currentPlayerAnswers,
        game.gameQuestions,
        player,
      );

      await this.handleGameProgress(game, answer, queryRunner, playerId);
      await this.upScore(answer, queryRunner, game);

      const result: GameUserAnswer = await queryRunner.manager.save(answer);
      await queryRunner.commitTransaction();
      return this.applicationObjectResult.success(result.id);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.applicationObjectResult.internalServerError();
    } finally {
      await queryRunner.release();
    }
  }

  // If game has Pending or Finished status or game not exist throw false
  private isGameValid(game: QuizGame | null): boolean {
    return !!game && game.status === QuizGameStatusEnum.Active;
  }

  private async handleGameProgress(
    game: QuizGame,
    newAnswerCurrentPlayer: GameUserAnswer,
    queryRunner: QueryRunner,
    playerId: number,
  ): Promise<void> {
    const currentPlayer: GamePlayers = game.gamePlayers.find(
      (p: GamePlayers): boolean => p.playerId === playerId,
    );
    const secondPlayer: GamePlayers = game.gamePlayers.find(
      (p: GamePlayers): boolean => p.playerId !== playerId,
    );
    const currentPlayerAnswersCount = currentPlayer.player.playerAnswers.length;
    const secondPlayerAnswersCount = secondPlayer.player.playerAnswers.length;
    if (currentPlayerAnswersCount + 1 === 5 && secondPlayerAnswersCount === 5) {
      game.finishGame();

      currentPlayer.player.playerAnswers.push(newAnswerCurrentPlayer);
      currentPlayer.setWinStatus(secondPlayer);
      currentPlayer.setFinallyScore(secondPlayer);
      await queryRunner.manager.save(game);
    } else if (
      currentPlayerAnswersCount + 1 === 5 &&
      secondPlayerAnswersCount < 5
    ) {
      currentPlayer.setFirst();
      await queryRunner.manager.save(currentPlayer);
    }
  }

  private async upScore(
    answer: GameUserAnswer,
    queryRunner: QueryRunner,
    game: QuizGame,
  ): Promise<void> {
    if (answer.isTrue) {
      const currentPlayer: GamePlayers = game.gamePlayers.find(
        (p: GamePlayers): boolean => p.playerId === answer.playerId,
      );
      currentPlayer.setScore();
      await queryRunner.manager.save(currentPlayer);
    }
  }
}
