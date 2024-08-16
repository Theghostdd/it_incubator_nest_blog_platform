import {
  BaseSorting,
  BaseSortingType,
} from '../../../../../base/sorting/base-sorting';
import { UserSortQueryType } from '../../../../user/api/models/input/user-input.model';
import { Injectable } from '@nestjs/common';

export class BlogInputModel {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

export class BlogUpdateModel {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

export type BlogSortQueryType = BaseSortingType & {
  searchNameTerm: string;
};

export class BlogSortingQuery extends BaseSorting {
  constructor(
    sortBy: string,
    sortDirection: string,
    pageNumber: number,
    pageSize: number,
    public readonly searchNameTerm: string,
  ) {
    super(sortBy, sortDirection, pageNumber, pageSize);
  }

  public createBlogQuery(query: BlogSortingQuery): BlogSortQueryType {
    return {
      ...this.createBaseQuery(query),
      searchNameTerm: query.searchNameTerm ? query.searchNameTerm : '',
    };
  }
}
