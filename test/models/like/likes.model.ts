import { LikeStatusEnum } from '../../../src/features/blog-platform/like/domain/type';

export class LikeTestModel {
  public likeStatus: LikeStatusEnum;
  constructor() {
    this.likeStatus = LikeStatusEnum.Like;
  }

  getLikeUpdateModel() {
    return {
      likeStatus: this.likeStatus,
    };
  }
}
