import {
  BaseSorting,
  BaseSortingType,
} from '../../../../../base/sorting/base-sorting';
import { UserInputModelValidationRules } from '../../../../../core/utils/validation-rules/validation-rules';

export class UserInputModel extends UserInputModelValidationRules {
  public login: string;
  public password: string;
  public email: string;
}

export type UserSortQueryType = BaseSortingType & {
  searchLoginTerm: string;
  searchEmailTerm: string;
};

export class UserSortingQuery extends BaseSorting {
  constructor(
    sortBy: string,
    sortDirection: string,
    pageNumber: number,
    pageSize: number,
    public readonly searchLoginTerm: string,
    public readonly searchEmailTerm: string,
  ) {
    super(sortBy, sortDirection, pageNumber, pageSize);
  }

  public createUserQuery(query: UserSortingQuery): UserSortQueryType {
    return query
      ? {
          ...this.createBaseQuery(query),
          searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : '',
          searchEmailTerm: query.searchEmailTerm
            ? query.searchEmailTerm
            : 'searchEmailTerm',
        }
      : {
          ...this.createBaseQuery(query),
          searchLoginTerm: '',
          searchEmailTerm: 'searchEmailTerm',
        };
  }
}
