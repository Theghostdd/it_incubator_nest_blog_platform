import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';

export enum SortDirectionEnum {
  'ASC' = 'ASC',
  'DESC' = 'DESC',
  'asc' = 'asc',
  'desc' = 'desc',
}

export type BaseSortingType = {
  sortBy: string;
  sortDirection: SortDirectionEnum;
  pageNumber: number;
  pageSize: number;
};

@Injectable()
export class BaseSorting {
  private sortByParams: string[] = [
    'createdAt',
    'updatedAt',
    'lastUpdateAt',
    'name',
    'title',
    'login',
    'email',
    'content',
    'blogName',
  ];
  private defaultSortParams: BaseSortingType = {
    sortBy: 'createdAt',
    sortDirection: SortDirectionEnum.DESC,
    pageNumber: 1,
    pageSize: 10,
  };
  @ApiProperty({
    description: 'The field by which to sort the items',
    example: 'createdAt',
    type: String,
    required: false,
  })
  public readonly sortBy: string;

  @ApiProperty({
    description:
      'The direction of the sort (asc for ascending, desc for descending)',
    example: 'asc',
    type: String,
    required: false,
  })
  public readonly sortDirection: SortDirectionEnum;

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

  constructor() {}

  public createBaseQuery(query: BaseSorting): BaseSortingType {
    return query
      ? {
          sortBy: this.sortByParams.includes(query.sortBy)
            ? query.sortBy
            : 'createdAt',
          sortDirection:
            query.sortDirection === 'asc' ||
            query.sortDirection === 'desc' ||
            query.sortDirection === 'ASC' ||
            query.sortDirection === 'DESC'
              ? (query.sortDirection.toUpperCase() as SortDirectionEnum)
              : this.defaultSortParams.sortDirection,
          pageNumber: query.pageNumber
            ? Number(query.pageNumber)
            : this.defaultSortParams.pageNumber,
          pageSize: query.pageSize
            ? Number(query.pageSize)
            : this.defaultSortParams.pageSize,
        }
      : {
          sortBy: this.defaultSortParams.sortBy,
          sortDirection: this.defaultSortParams.sortDirection,
          pageNumber: this.defaultSortParams.pageNumber,
          pageSize: this.defaultSortParams.pageSize,
        };
  }
}
