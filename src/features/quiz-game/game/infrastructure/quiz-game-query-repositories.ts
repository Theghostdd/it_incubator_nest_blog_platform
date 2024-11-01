import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import {
  QuizGameMapperOutputModel,
  QuizGameOutputModel,
} from '../api/models/output/quiz-game-output.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { QuizGamePropertyEnum, QuizGameStatusEnum } from '../domain/types';
import { QuizGamePlayer } from '../../player/domain/quiz-game-player.entity';
import { PlayerPropertyEnum } from '../../player/domain/types';
import { GamePlayerPropertyEnum } from '../../game-player/domain/types';
import { GameSpecifyQuestionsPropertyEnum } from '../../game-questions/domain/types';
import { GameUserAnswerPropertyEnum } from '../../game-answer/domain/types';
import { GamePlayers } from '../../game-player/domain/game-players.entity';

@Injectable()
export class QuizGameQueryRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly quizGameRepository: Repository<QuizGame>,
    @InjectRepository(QuizGamePlayer)
    private readonly quizGamePlayerRepository: Repository<QuizGamePlayer>,
    private readonly quizGameMapperOutputModel: QuizGameMapperOutputModel,
  ) {}

  async getGameById(
    gameId: number,
    currentUserId: number,
  ): Promise<QuizGameOutputModel> {
    const game: QuizGame | null = await this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .leftJoinAndSelect(`gp.${GamePlayerPropertyEnum.player}`, 'p')
      .leftJoinAndSelect(`p.${PlayerPropertyEnum.user}`, 'u')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gameQuestions}`, 'gq')
      .leftJoinAndSelect(
        `p.${PlayerPropertyEnum.userAnswers}`,
        'qa',
        `qa."${GameUserAnswerPropertyEnum.questionId}" = gq.id`,
      )
      .leftJoinAndSelect(`gq.${GameSpecifyQuestionsPropertyEnum.question}`, 'q')
      .where(`g.${QuizGamePropertyEnum.id} = :gameId`, { gameId })
      .getOne();

    if (!game) throw new NotFoundException(`Game does not exist`);

    const isParticipant = game.gamePlayers.some(
      (player: GamePlayers): boolean => player.player.userId === currentUserId,
    );

    if (!isParticipant) throw new ForbiddenException();
    return this.quizGameMapperOutputModel.mapQuizGame(game, currentUserId);
  }

  async getGameCurrentUser(
    currentUserId: number,
  ): Promise<QuizGameOutputModel> {
    const player: QuizGamePlayer = await this.quizGamePlayerRepository.findOne({
      where: { userId: currentUserId },
    });
    const playerId = player.id;

    const findGame: QuizGame | null = await this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .where(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where(`g.${QuizGamePropertyEnum.status} = :statusActive`, {
            statusActive: QuizGameStatusEnum.Active,
          }).orWhere(`g.${QuizGamePropertyEnum.status} = :statusPending`, {
            statusPending: QuizGameStatusEnum.PendingSecondPlayer,
          });
        }),
      )
      .andWhere(`gp.${GamePlayerPropertyEnum.playerId} = :playerId`, {
        playerId,
      })
      .getOne();

    if (!findGame) throw new NotFoundException(`Game does not exist`);

    const gameId = findGame.id;
    const game: QuizGame | null = await this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .leftJoinAndSelect(`gp.${GamePlayerPropertyEnum.player}`, 'p')
      .leftJoinAndSelect(`p.${PlayerPropertyEnum.user}`, 'u')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gameQuestions}`, 'gq')
      .leftJoinAndSelect(
        `p.${PlayerPropertyEnum.userAnswers}`,
        'qa',
        `qa."${GameUserAnswerPropertyEnum.questionId}" = gq.id`,
      )
      .leftJoinAndSelect(`gq.${GameSpecifyQuestionsPropertyEnum.question}`, 'q')
      .where(`g.${QuizGamePropertyEnum.id} = :gameId`, { gameId })
      .getOne();

    return this.quizGameMapperOutputModel.mapQuizGame(game, currentUserId);
  }
}
