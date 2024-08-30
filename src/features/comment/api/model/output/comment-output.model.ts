import { CommentDocumentType } from '../../../domain/comment.entity';
import { LikeStatusEnum } from '../../../../like/domain/type';
import { LikeDocumentType } from '../../../../like/domain/like.entity';

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
  commentModel(
    comment: CommentDocumentType,
    userLikeStatus: LikeDocumentType,
  ): CommentOutputModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: !userLikeStatus ? LikeStatusEnum.None : userLikeStatus.status,
      },
      createdAt: comment.createdAt,
    };
  }

  commentsModel(
    comments: CommentDocumentType[],
    likes: LikeDocumentType[],
  ): CommentOutputModel[] {
    return comments.map((comment: CommentDocumentType) => {
      const foundLike: LikeDocumentType = likes.find(
        (like: LikeDocumentType) => like.parentId === comment._id.toString(),
      );
      const userStatus: LikeStatusEnum = foundLike
        ? foundLike.status
        : LikeStatusEnum.None;
      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus: userStatus,
        },
        createdAt: comment.createdAt,
      };
    });
  }
}
