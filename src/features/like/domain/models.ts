import { LikeStatusEnum } from './type';

export class LikeChangeCount {
  public newLikesCount: number;
  public newDislikesCount: number;
  public newStatus: LikeStatusEnum;
}

export class LikeStatusState {
  [key: string]: {
    [key: string]: LikeChangeCount;
  };

  constructor(likeStatus: {
    [key: string]: { [key: string]: LikeChangeCount };
  }) {
    Object.assign(this, likeStatus);
  }
}

export class NewestLikesModel {
  public addedAt: string;
  public userId: string;
  public login: string;
}
