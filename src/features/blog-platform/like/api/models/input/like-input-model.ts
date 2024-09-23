import { LikeStatusEnum } from '../../../domain/type';
import { LikeInputModelValidationRules } from '../../../../../../core/utils/validation-rules/validation-rules';

export class LikeInputModel extends LikeInputModelValidationRules {
  public likeStatus: LikeStatusEnum;
}
