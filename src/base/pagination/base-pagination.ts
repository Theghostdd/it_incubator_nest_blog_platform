import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BasePagination<T> {
  @ApiProperty({
    description: 'Total number of pages available',
    example: 5,
  })
  public readonly pagesCount: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  public readonly page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  public readonly pageSize: number;

  @ApiProperty({
    description: 'Total number of items available',
    example: 50,
  })
  public readonly totalCount: number;

  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: Object,
  })
  public readonly items: T;
}
