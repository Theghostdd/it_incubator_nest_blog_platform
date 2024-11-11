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
  QuizGameStatisticWithPlayerInfoModel,
} from '../api/models/output/quiz-game-output.models';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import {
  QuizGamePropertyEnum,
  QuizGameStatusEnum,
  UserStatisticType,
  UserStatisticWithUserInfoType,
} from '../domain/types';
import { Player } from '../../player/domain/quiz-game-player.entity';
import { PlayerPropertyEnum } from '../../player/domain/types';
import {
  GamePlayerPropertyEnum,
  WinStatusEnum,
} from '../../game-player/domain/types';
import { GameSpecifyQuestionsPropertyEnum } from '../../game-questions/domain/types';
import { GamePlayerAnswerPropertyEnum } from '../../game-answer/domain/types';
import { GamePlayers } from '../../game-player/domain/game-players.entity';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import {
  QuizGameQuery,
  QuizTopGamePlayersQuery,
} from '../api/models/input/quiz-game-input.model';
import { UserPropertyEnum } from '../../../users/user/domain/types';

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
    private readonly quizTopGamePlayersQuery: QuizTopGamePlayersQuery,
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

    const result: UserStatisticType = await this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoin(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .select([
        `CAST(COUNT(g.${QuizGamePropertyEnum.id}) as INT) as "${QuizGamePropertyEnum.gamesCount}"`,
        `CAST(SUM(CASE WHEN gp.${GamePlayerPropertyEnum.winStatus} = :winsStatus THEN 1 ELSE 0 END) as INT) as "${GamePlayerPropertyEnum.winsCount}"`,
        `CAST(SUM(CASE WHEN gp.${GamePlayerPropertyEnum.winStatus} = :lossesStatus THEN 1 ELSE 0 END) as INT) as "${GamePlayerPropertyEnum.lossesCount}"`,
        `CAST(SUM(CASE WHEN gp.${GamePlayerPropertyEnum.winStatus} = :drawStatus THEN 1 ELSE 0 END) as INT) as "${GamePlayerPropertyEnum.drawsCount}"`,
        `CAST(SUM(gp.${GamePlayerPropertyEnum.score}) as INT) as "${QuizGamePropertyEnum.sumScore}"`,
        `ROUND(AVG(gp.${GamePlayerPropertyEnum.score}), 2) as "${QuizGamePropertyEnum.avgScores}"`,
      ])
      .where(`gp.${GamePlayerPropertyEnum.playerId} = :playerId`, { playerId })
      .setParameters({
        winsStatus: WinStatusEnum.win,
        lossesStatus: WinStatusEnum.lose,
        drawStatus: WinStatusEnum.draw,
      })
      .getRawOne();

    return this.quizGameMapperOutputModel.mapQuizGamePlayerStatistic(result);
  }

  async getTopGamePlayersStatistic(
    query: QuizTopGamePlayersQuery,
  ): Promise<BasePagination<QuizGameStatisticWithPlayerInfoModel[] | []>> {
    const { sort, sortDirection, pageSize, pageNumber } =
      this.quizTopGamePlayersQuery.createQuery(query);

    const skip: number = (pageNumber - 1) * pageSize;

    const queryGame = this.quizGameRepository
      .createQueryBuilder('g')
      .leftJoin(`g.${QuizGamePropertyEnum.gamePlayers}`, 'gp')
      .leftJoin(`gp.${GamePlayerPropertyEnum.player}`, 'p')
      .leftJoin(`p.${PlayerPropertyEnum.user}`, 'u')
      .select([
        `u.${UserPropertyEnum.id} as "${UserPropertyEnum.userId}"`,
        `u.${UserPropertyEnum.login} as "${UserPropertyEnum.login}"`,
        `CAST(COUNT(g.${QuizGamePropertyEnum.id}) as INT) as "${QuizGamePropertyEnum.gamesCount}"`,
        `CAST(SUM(CASE WHEN gp.${GamePlayerPropertyEnum.winStatus} = :winsStatus THEN 1 ELSE 0 END) as INT) as "${GamePlayerPropertyEnum.winsCount}"`,
        `CAST(SUM(CASE WHEN gp.${GamePlayerPropertyEnum.winStatus} = :lossesStatus THEN 1 ELSE 0 END) as INT) as "${GamePlayerPropertyEnum.lossesCount}"`,
        `CAST(SUM(CASE WHEN gp.${GamePlayerPropertyEnum.winStatus} = :drawStatus THEN 1 ELSE 0 END) as INT) as "${GamePlayerPropertyEnum.drawsCount}"`,
        `CAST(SUM(gp.${GamePlayerPropertyEnum.score}) as INT) as "${QuizGamePropertyEnum.sumScore}"`,
        `ROUND(AVG(gp.${GamePlayerPropertyEnum.score}), 2) as "${QuizGamePropertyEnum.avgScores}"`,
      ])
      .setParameters({
        winsStatus: WinStatusEnum.win,
        lossesStatus: WinStatusEnum.lose,
        drawStatus: WinStatusEnum.draw,
      })
      .groupBy(`u.${UserPropertyEnum.id}`)
      .offset(skip)
      .limit(pageSize);

    sort.forEach((sortParams: string, i: number) => {
      queryGame.addOrderBy(
        `"${sortParams}"`,
        sortDirection[i] as 'ASC' | 'DESC',
      );
    });

    const result: [UserStatisticWithUserInfoType[], number] = await Promise.all(
      [
        queryGame.getRawMany(),
        this.quizGamePlayerRepository.createQueryBuilder('p').getCount(),
      ],
    );

    const totalCount: number = result[1];
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: +pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items:
        result[0].length > 0
          ? this.quizGameMapperOutputModel.mapQuizTopGamePlayersStatistic(
              result[0],
            )
          : [],
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
