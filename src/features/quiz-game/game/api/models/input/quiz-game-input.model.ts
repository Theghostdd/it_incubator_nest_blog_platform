import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import {
  BaseSorting,
  SortDirectionEnum,
} from '../../../../../../base/sorting/base-sorting';
import { QuizGamePropertyEnum } from '../../../domain/types';
import { GamePlayerPropertyEnum } from '../../../../game-player/domain/types';
import { UserPropertyEnum } from '../../../../../users/user/domain/types';

export class QuizGameAnswerQuestionInputModel {
  @ApiProperty({
    description: 'Answer`s body',
    example: 'This is answer for question',
    type: String,
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  answer: string;
}

@Injectable()
export class QuizGameQuery extends BaseSorting {
  private sortByParamsQuizGame: string[] = [
    'pairCreatedDate',
    'startGameDate',
    'finishGameDate',
    'status',
  ];
  createQuery(query: BaseSorting) {
    const modifyQuery = {
      ...query,
      sortBy: this.sortByParamsQuizGame.includes(query.sortBy)
        ? query.sortBy
        : QuizGamePropertyEnum.pairCreatedDate,
    };
    const baseQuery = this.createBaseQuery(modifyQuery as BaseSorting);
    return {
      ...baseQuery,
      sortBy: query?.sortBy
        ? baseQuery.sortBy
        : QuizGamePropertyEnum.pairCreatedDate,
    };
  }
}
export type QuizTopGamePlayersQueryDefaultParamsType = {
  sort: string[];
  sortDirection: string[];
  pageNumber: number;
  pageSize: number;
};

@Injectable()
export class QuizTopGamePlayersQuery {
  private sortByParamsQuizGame: string[] = [
    QuizGamePropertyEnum.gamesCount,
    QuizGamePropertyEnum.avgScores,
    QuizGamePropertyEnum.sumScore,
    GamePlayerPropertyEnum.winsCount,
    GamePlayerPropertyEnum.drawsCount,
    GamePlayerPropertyEnum.lossesCount,
    GamePlayerPropertyEnum.id,
    UserPropertyEnum.login,
  ];
  private defaultParams: QuizTopGamePlayersQueryDefaultParamsType = {
    sort: [QuizGamePropertyEnum.avgScores, QuizGamePropertyEnum.sumScore],
    sortDirection: [SortDirectionEnum.DESC, SortDirectionEnum.DESC],
    pageNumber: 1,
    pageSize: 10,
  };

  @ApiProperty({
    description: 'Can be a single string or an array of strings.',
    required: false,
    isArray: true,
  })
  public readonly sort: string[] | string;

  @ApiProperty({
    description: 'The page number to retrieve',
    example: 1,
    type: Number,
    required: false,
  })
  public readonly pageNumber: number;

  @ApiProperty({
    description: 'The number of items per page',
    example: 10,
    type: Number,
    required: false,
  })
  public readonly pageSize: number;

  createQuery(
    query: QuizTopGamePlayersQuery,
  ): QuizTopGamePlayersQueryDefaultParamsType {
    const { sort, pageSize, pageNumber } = query;
    const sortParams = this.extractSortParams(sort);

    return {
      sort:
        sortParams.keys.length > 0 ? sortParams.keys : this.defaultParams.sort,
      sortDirection:
        sortParams.directions.length > 0
          ? sortParams.directions
          : this.defaultParams.sortDirection,
      pageSize: pageSize || this.defaultParams.pageSize,
      pageNumber: pageNumber || this.defaultParams.pageNumber,
    };
  }

  private extractSortParams(sort: string | string[] | undefined) {
    if (Array.isArray(sort)) {
      const keys = [];
      const directions = [];

      sort.forEach((s) => {
        const [key, direction] = s.split(' ');
        if (this.handleKeyParam(key)) {
          keys.push(key);
          directions.push(this.handleDirectionParams(direction));
        }
      });

      return { keys, directions };
    }

    if (typeof sort === 'string') {
      const [key, direction] = sort.split(' ');
      if (this.handleKeyParam(key)) {
        return {
          keys: [key],
          directions: [this.handleDirectionParams(direction)],
        };
      }
    }

    return { keys: [], directions: [] };
  }

  private handleDirectionParams(direction: string): string {
    return ['ASC', 'DESC', 'asc', 'desc'].includes(direction)
      ? direction.toUpperCase()
      : 'DESC';
  }

  private handleKeyParam(key: string): boolean {
    return this.sortByParamsQuizGame.includes(key);
  }
}
