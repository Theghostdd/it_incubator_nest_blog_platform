import { LikeStatusEnum } from '../../../../like/domain/type';
import { CommentEntityRawDataType } from '../../../domain/types';

export class CommentatorInfoViewModel {
  constructor(
    public userId: string,
    public userLogin: string,
  ) {}
}

export class CommentLikesInfoViewModel {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: LikeStatusEnum,
  ) {}
}

export class CommentOutputModel {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfoViewModel,
    public likesInfo: CommentLikesInfoViewModel,
    public createdAt: string,
  ) {}
}

export class CommentMapperOutputModel {
  constructor() {}
  commentModel(comment: CommentEntityRawDataType): CommentOutputModel {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesCount ? +comment.likesCount : 0,
        dislikesCount: comment.dislikesCount ? +comment.dislikesCount : 0,
        myStatus: comment.currentUserLikeStatus
          ? comment.currentUserLikeStatus
          : LikeStatusEnum.None,
      },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  commentsModel(comments: CommentEntityRawDataType[]): CommentOutputModel[] {
    return comments.map((comment: CommentEntityRawDataType) => {
      return {
        id: comment.id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId.toString(),
          userLogin: comment.userLogin,
        },
        likesInfo: {
          likesCount: comment.likesCount ? +comment.likesCount : 0,
          dislikesCount: comment.dislikesCount ? +comment.dislikesCount : 0,
          myStatus: comment.currentUserLikeStatus
            ? comment.currentUserLikeStatus
            : LikeStatusEnum.None,
        },
        createdAt: comment.createdAt.toISOString(),
      };
    });
  }
}
