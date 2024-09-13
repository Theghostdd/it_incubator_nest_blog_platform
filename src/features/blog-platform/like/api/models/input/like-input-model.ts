import { LikeInputModelValidationRules } from '../../../../../../core/utils/validation-rules/validation-rules';
import { LikeStatusEnum } from '../../../domain/type';

export class LikeInputModel extends LikeInputModelValidationRules {
  public likeStatus: LikeStatusEnum;
}
