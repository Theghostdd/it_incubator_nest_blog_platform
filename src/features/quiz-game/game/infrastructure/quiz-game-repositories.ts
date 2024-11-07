import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuizGame } from '../domain/quiz-game.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { QuizGamePropertyEnum, QuizGameStatusEnum } from '../domain/types';
import { GamePlayerAnswerPropertyEnum } from '../../game-answer/domain/types';
import { GamePlayerPropertyEnum } from '../../game-player/domain/types';
import { PlayerPropertyEnum } from '../../player/domain/types';
import { GameSpecifyQuestionsPropertyEnum } from '../../game-questions/domain/types';
import { QuizQuestionsPropertyEnum } from '../../questions/domain/types';

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

  async getCurrentGame(
    playerId: number,
    queryRunner?: QueryRunner,
  ): Promise<QuizGame | null> {
    if (queryRunner) {
      return await queryRunner.manager.findOne(this.quizGameRepository.target, {
        where: [
          { status: QuizGameStatusEnum.Active, gamePlayers: { playerId } },
          {
            status: QuizGameStatusEnum.PendingSecondPlayer,
            gamePlayers: { playerId },
          },
        ],
        lock: { mode: 'pessimistic_write' },
      });
    }
    return await this.quizGameRepository.findOne({
      where: [
        { status: QuizGameStatusEnum.Active, gamePlayers: { playerId } },
        {
          status: QuizGameStatusEnum.PendingSecondPlayer,
          gamePlayers: { playerId },
        },
      ],
    });
  }

  async getCurrentPlayerGameByIdWithAnswers(
    gameId: number,
    queryRunner?: QueryRunner,
  ): Promise<QuizGame | null> {
    if (queryRunner) {
      return await queryRunner.manager
        .createQueryBuilder(this.quizGameRepository.target, 'g')
        .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
        .leftJoinAndSelect(`gp.${GamePlayerPropertyEnum.player}`, 'p')
        .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gameQuestions}`, 'gq')
        .leftJoinAndSelect(
          `p.${PlayerPropertyEnum.playerAnswers}`,
          'pa',
          `pa.${GamePlayerAnswerPropertyEnum.gameQuestionId} = gq.${GameSpecifyQuestionsPropertyEnum.id}`,
        )
        .leftJoinAndSelect(
          `gq.${GameSpecifyQuestionsPropertyEnum.question}`,
          'q',
        )
        .leftJoinAndSelect(`q.${QuizQuestionsPropertyEnum.answers}`, 'qa')
        .where(`g.${QuizGamePropertyEnum.status} = :status`, {
          status: QuizGameStatusEnum.Active,
        })
        .andWhere(`g.${QuizGamePropertyEnum.id} = :gameId`, { gameId })
        .getOne();
    }
    return await this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .leftJoinAndSelect(`gp.${GamePlayerPropertyEnum.player}`, 'p')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gameQuestions}`, 'gq')
      .leftJoinAndSelect(
        `p.${PlayerPropertyEnum.playerAnswers}`,
        'pa',
        `pa.${GamePlayerAnswerPropertyEnum.gameQuestionId} = gq.${GameSpecifyQuestionsPropertyEnum.id}`,
      )
      .leftJoinAndSelect(`gq.${GameSpecifyQuestionsPropertyEnum.question}`, 'q')
      .leftJoinAndSelect(`q.${QuizQuestionsPropertyEnum.answers}`, 'qa')
      .where(`g.${QuizGamePropertyEnum.status} = :status`, {
        status: QuizGameStatusEnum.Active,
      })
      .andWhere(`g.${QuizGamePropertyEnum.id} = :gameId`, { gameId })
      .getOne();
  }
}
