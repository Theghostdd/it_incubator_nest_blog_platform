import {
  BaseSorting,
  BaseSortingType,
} from '../../../../../../base/sorting/base-sorting';
import {
  BlogInputModelValidationRules,
  BlogPostUpdateModelValidationRules,
  BlogUpdateModelValidationRules,
  PostBlogInputModelValidationRules,
} from '../../../../../../core/utils/validation-rules/validation-rules';

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

export class PostBlogInputModel extends PostBlogInputModelValidationRules {
  public title: string;
  public shortDescription: string;
  public content: string;
}

export class BlogPostUpdateModel extends BlogPostUpdateModelValidationRules {
  public title: string;
  public shortDescription: string;
  public content: string;
}
export type BlogSortQueryType = BaseSortingType & {
  searchNameTerm: string;
};

export class BlogSortingQuery extends BaseSorting {
  constructor(public readonly searchNameTerm: string) {
    super();
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
