import { LikeStatusEnum } from '../../../../like/domain/type';
import { CommentLikeJoinType } from '../../../domain/comment.entity';

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
  commentModel(comment: CommentLikeJoinType): CommentOutputModel {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: comment.status,
      },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  commentsModel(comments: CommentLikeJoinType[]): CommentOutputModel[] {
    return comments.map((comment: CommentLikeJoinType) => {
      return {
        id: comment.id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId.toString(),
          userLogin: comment.userLogin,
        },
        likesInfo: {
          likesCount: comment.likesCount,
          dislikesCount: comment.dislikesCount,
          myStatus: comment.status,
        },
        createdAt: comment.createdAt.toISOString(),
      };
    });
  }
}
