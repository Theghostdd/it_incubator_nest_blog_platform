import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuizGame } from '../domain/quiz-game.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { QuizGamePropertyEnum, QuizGameStatusEnum } from '../domain/types';
import { GameSpecifyQuestionsPropertyEnum } from '../../game-questions/domain/types';
import { QuizQuestionsPropertyEnum } from '../../questions/domain/types';
import { GamePlayerPropertyEnum } from '../../game-player/domain/types';
import { PlayerPropertyEnum } from '../../player/domain/types';

export class QuizGameRepositories {
  constructor(
    @InjectRepository(QuizGame)
    private readonly quizGameRepository: Repository<QuizGame>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async save(game: QuizGame): Promise<number | null> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const gameEntity: QuizGame = await queryRunner.manager.save(game);
      await queryRunner.commitTransaction();
      return gameEntity.id;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async getRandomPendingGame(): Promise<QuizGame | null> {
    return await this.quizGameRepository
      .createQueryBuilder('g')
      .orderBy('RANDOM()')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .where(`g.${QuizGamePropertyEnum.status} = :status`, {
        status: QuizGameStatusEnum.PendingSecondPlayer,
      })
      .getOne();
  }

  async getCurrentPlayerGame(playerId: number): Promise<QuizGame | null> {
    return await this.quizGameRepository.findOne({
      where: [
        { status: QuizGameStatusEnum.Active, gamePlayers: { playerId } },
        {
          status: QuizGameStatusEnum.PendingSecondPlayer,
          gamePlayers: { playerId },
        },
      ],
      relations: [
        QuizGamePropertyEnum.gamePlayers,
        QuizGamePropertyEnum.gameQuestions,
      ],
    });
  }

  async getCurrentPlayerGameByIdWithAnswers(
    gameId: number,
  ): Promise<QuizGame | null> {
    return await this.quizGameRepository.findOne({
      where: [{ status: QuizGameStatusEnum.Active, id: gameId }],
      relations: [
        QuizGamePropertyEnum.gamePlayers,
        `${QuizGamePropertyEnum.gamePlayers}.${GamePlayerPropertyEnum.player}.${PlayerPropertyEnum.userAnswers}`,
        QuizGamePropertyEnum.gameQuestions,
        `${QuizGamePropertyEnum.gameQuestions}.${GameSpecifyQuestionsPropertyEnum.question}.${QuizQuestionsPropertyEnum.answers}`,
      ],
    });
  }
}
