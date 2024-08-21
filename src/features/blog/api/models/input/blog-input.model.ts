import {
  BaseSorting,
  BaseSortingType,
} from '../../../../../base/sorting/base-sorting';
import {
  BlogInputModelValidationRules,
  BlogUpdateModelValidationRules,
  PostBlogInputModelValidationRules,
} from '../../../../../infrastructure/utils/validation-rules/validation-rules';

export class PostBlogInputModel extends PostBlogInputModelValidationRules {
  public title: string;
  public shortDescription: string;
  public content: string;
}

export class BlogInputModel extends BlogInputModelValidationRules {
  public name: string;
  public description: string;
  public websiteUrl: string;
}

export class BlogUpdateModel extends BlogUpdateModelValidationRules {
  public name: string;
  public description: string;
  public websiteUrl: string;
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
    return query
      ? {
          ...this.createBaseQuery(query),
          searchNameTerm: query.searchNameTerm ? query.searchNameTerm : '',
        }
      : {
          ...this.createBaseQuery(query),
          searchNameTerm: '',
        };
  }
}
