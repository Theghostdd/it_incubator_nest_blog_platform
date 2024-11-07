import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import {
  QuizGameMapperOutputModel,
  QuizGameOutputModel,
  QuizGameStatisticModel,
} from '../api/models/output/quiz-game-output.models';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { QuizGamePropertyEnum, QuizGameStatusEnum } from '../domain/types';
import { Player } from '../../player/domain/quiz-game-player.entity';
import { PlayerPropertyEnum } from '../../player/domain/types';
import { GamePlayerPropertyEnum } from '../../game-player/domain/types';
import { GameSpecifyQuestionsPropertyEnum } from '../../game-questions/domain/types';
import { GamePlayerAnswerPropertyEnum } from '../../game-answer/domain/types';
import { GamePlayers } from '../../game-player/domain/game-players.entity';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { QuizGameQuery } from '../api/models/input/quiz-game-input.model';

@Injectable()
export class QuizGameQueryRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly quizGameRepository: Repository<QuizGame>,
    @InjectRepository(Player)
    private readonly quizGamePlayerRepository: Repository<Player>,
    @InjectRepository(GamePlayers)
    private readonly gamePlayerRepository: Repository<GamePlayers>,
    private readonly quizGameMapperOutputModel: QuizGameMapperOutputModel,
    private readonly quizGameQuery: QuizGameQuery,
  ) {}

  async getGameById(
    gameId: number,
    currentUserId: number,
  ): Promise<QuizGameOutputModel> {
    if (gameId === 0)
      throw new BadRequestException({
        message: 'Id is not correct',
        field: 'id',
      });

    const game: QuizGame | null = await this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .leftJoinAndSelect(`gp.${GamePlayerPropertyEnum.player}`, 'p')
      .leftJoinAndSelect(`p.${PlayerPropertyEnum.user}`, 'u')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gameQuestions}`, 'gq')
      .leftJoinAndSelect(
        `p.${PlayerPropertyEnum.playerAnswers}`,
        'qa',
        `qa."${GamePlayerAnswerPropertyEnum.gameQuestionId}" = gq.id`,
      )
      .leftJoinAndSelect(`gq.${GameSpecifyQuestionsPropertyEnum.question}`, 'q')
      .where(`g.${QuizGamePropertyEnum.id} = :gameId`, { gameId })
      .orderBy(`gq.${GameSpecifyQuestionsPropertyEnum.position}`, 'ASC')
      .addOrderBy(`qa.${GamePlayerAnswerPropertyEnum.position}`, 'ASC')
      .getOne();

    if (!game) throw new NotFoundException(`Game does not exist`);

    const isParticipant = game.gamePlayers.some(
      (player: GamePlayers): boolean => player.player.userId === currentUserId,
    );

    if (!isParticipant) throw new ForbiddenException();
    return this.quizGameMapperOutputModel.mapQuizGame(game);
  }

  async getGameCurrentUser(
    currentUserId: number,
  ): Promise<QuizGameOutputModel> {
    const player: Player = await this.quizGamePlayerRepository.findOne({
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
        `p.${PlayerPropertyEnum.playerAnswers}`,
        'qa',
        `qa."${GamePlayerAnswerPropertyEnum.gameQuestionId}" = gq.id`,
      )
      .leftJoinAndSelect(`gq.${GameSpecifyQuestionsPropertyEnum.question}`, 'q')
      .where(`g.${QuizGamePropertyEnum.id} = :gameId`, { gameId })
      .orderBy(`gq.${GameSpecifyQuestionsPropertyEnum.position}`, 'ASC')
      .addOrderBy(`qa.${GamePlayerAnswerPropertyEnum.position}`, 'ASC')
      .getOne();

    return this.quizGameMapperOutputModel.mapQuizGame(game);
  }

  async getAllCurrentPlayerGames(
    userId: number,
    query: QuizGameQuery,
  ): Promise<BasePagination<QuizGameOutputModel[] | []>> {
    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.quizGameQuery.createQuery(query);

    const player: Player = await this.quizGamePlayerRepository.findOne({
      where: { userId: userId },
    });
    const playerId = player.id;

    const skip: number = (pageNumber - 1) * pageSize;

    const gameIdsQuery = this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoin(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .where(`gp.${GamePlayerPropertyEnum.playerId} = :playerId`, {
        playerId: playerId,
      })
      .skip(skip)
      .take(pageSize);

    if (sortBy && sortBy !== QuizGamePropertyEnum.pairCreatedDate) {
      gameIdsQuery.orderBy(`g.${sortBy}`, sortDirection as 'ASC' | 'DESC');
    }

    this.applySortingForUsersGames(gameIdsQuery, sortBy, sortDirection);

    const gameIds: [QuizGame[] | [], number] =
      await gameIdsQuery.getManyAndCount();

    const ids = gameIds[0].map(
      (game: QuizGame) => game[`${QuizGamePropertyEnum.id}`],
    );

    const queryRepo = this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .leftJoinAndSelect(`gp.${GamePlayerPropertyEnum.player}`, 'p')
      .leftJoinAndSelect(`p.${PlayerPropertyEnum.user}`, 'u')
      .leftJoinAndSelect(`g.${QuizGamePropertyEnum.gameQuestions}`, 'gq')
      .leftJoinAndSelect(
        `p.${PlayerPropertyEnum.playerAnswers}`,
        'qa',
        `qa."${GamePlayerAnswerPropertyEnum.gameQuestionId}" = gq.${GameSpecifyQuestionsPropertyEnum.id}`,
      )
      .leftJoinAndSelect(`gq.${GameSpecifyQuestionsPropertyEnum.question}`, 'q')
      .whereInIds(ids);

    this.applySortingForUsersGames(queryRepo, sortBy, sortDirection);
    queryRepo
      .addOrderBy(`gq.${GameSpecifyQuestionsPropertyEnum.position}`, 'ASC')
      .addOrderBy(`qa.${GamePlayerAnswerPropertyEnum.position}`, 'ASC');

    const games: QuizGame[] | [] = await queryRepo.getMany();

    const totalCount: number = gameIds[1];
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: +pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items:
        games.length > 0
          ? this.quizGameMapperOutputModel.mapQuizGames(games)
          : [],
    };
  }

  async getCurrentUserStatistic(
    userId: number,
  ): Promise<QuizGameStatisticModel> {
    const player: Player = await this.quizGamePlayerRepository.findOne({
      where: { userId: userId },
    });
    const playerId = player.id;
    // TODO
    return {
      gamesCount: 0,
      avgScores: 0,
      drawsCount: 0,
      lossesCount: 0,
      sumScore: 0,
      winsCount: 0,
    };
  }

  private applySortingForUsersGames(
    entityQuery: SelectQueryBuilder<QuizGame>,
    sortBy: string,
    sortDirection: string,
  ): SelectQueryBuilder<QuizGame> {
    if (sortBy && sortBy !== QuizGamePropertyEnum.pairCreatedDate) {
      entityQuery.orderBy(`g.${sortBy}`, sortDirection as 'ASC' | 'DESC');
    }

    const direction =
      sortBy === QuizGamePropertyEnum.pairCreatedDate ? sortDirection : 'DESC';
    entityQuery.addOrderBy(
      `g.${QuizGamePropertyEnum.pairCreatedDate}`,
      direction as 'ASC' | 'DESC',
    );

    return entityQuery;
  }
}
