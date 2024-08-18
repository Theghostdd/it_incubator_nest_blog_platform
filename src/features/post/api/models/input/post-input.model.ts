import {
  PostInputModelValidationRules,
  PostUpdateModelValidationRules,
} from '../../../../../infrastructure/utils/validation-rules/validation-rules';

export class PostInputModel extends PostInputModelValidationRules {
  public title: string;
  public shortDescription: string;
  public content: string;
  public blogId: string;
}

export class PostUpdateModel extends PostUpdateModelValidationRules {
  public title: string;
  public shortDescription: string;
  public content: string;
  public blogId: string;
}
