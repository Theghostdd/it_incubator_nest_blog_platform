import {
  CommentInputModelValidationRules,
  CommentUpdateModelValidationRules,
} from '../../../../../../core/utils/validation-rules/validation-rules';

export class CommentInputModel extends CommentInputModelValidationRules {
  public content: string;
}

export class CommentUpdateModel extends CommentUpdateModelValidationRules {
  public content: string;
}
