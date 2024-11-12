import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepositories } from '../../infrastructure/quiz-game-repositories';
import { QuizGame } from '../../domain/quiz-game.entity';
import { GameUserAnswer } from '../../../game-answer/domain/game-user-answer.entity';
import { Inject } from '@nestjs/common';
import { GamePlayers } from '../../../game-player/domain/game-players.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

export class EndActiveGameCommand {
  constructor() {}
}
@CommandHandler(EndActiveGameCommand)
export class EndActiveGameHandler
  implements ICommandHandler<EndActiveGameCommand, boolean>
{
  constructor(
    @Inject(GameUserAnswer.name)
    private readonly gameUserAnswer: typeof GameUserAnswer,
    private readonly quizGameRepositories: QuizGameRepositories,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}
  async execute(command: EndActiveGameCommand): Promise<boolean> {
    const countNeedAnswers: number = 5;
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const games: QuizGame[] | [] =
        await this.quizGameRepositories.getAllFinishedActiveGame(queryRunner);

      if (games.length === 0) return false;
      const allGamesToSave: QuizGame[] = [];
      const allAnswersToSave: GameUserAnswer[] = [];
      for (const game of games) {
        const losePlayer: GamePlayers = game.gamePlayers.find(
          (p: GamePlayers) => p.player.playerAnswers.length < 5,
        );
        const secondPlayer: GamePlayers = game.gamePlayers.find(
          (p: GamePlayers) => p.player.playerAnswers.length === 5,
        );

        let answersCount = losePlayer.player.playerAnswers.length;
        while (answersCount < countNeedAnswers) {
          const answer = this.gameUserAnswer.createUnansweredQuestions(
            losePlayer,
            answersCount + 1,
            game.gameQuestions,
          );
          allAnswersToSave.push(answer);
          answersCount++;
        }

        losePlayer.setWinStatus(secondPlayer);
        losePlayer.setFinallyScore(secondPlayer);
        game.finishGame();

        allGamesToSave.push(game);
      }
      await queryRunner.manager.save(allGamesToSave);
      await queryRunner.manager.save(allAnswersToSave);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
