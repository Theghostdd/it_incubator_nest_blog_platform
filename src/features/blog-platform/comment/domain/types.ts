import { LikeStatusEnum } from '../../like/domain/type';

export enum CommentPropertyEnum {
  'id' = 'id',
  'content' = 'content',
  'createdAt' = 'createdAt',
  'isActive' = 'isActive',
  'post' = 'post',
  'postId' = 'postId',
  'user' = 'user',
  'userId' = 'userId',
  'userLogin' = 'userLogin',
  'likes' = 'likes',
  'likesCount' = 'likesCount',
  'dislikesCount' = 'dislikesCount',
  'currentUserLikeStatus' = 'currentUserLikeStatus',
  'commentQuantity' = 'commentQuantity',
}

export const selectCommentProperty = [
  `c.${CommentPropertyEnum.id} as "${CommentPropertyEnum.id}"`,
  `c.${CommentPropertyEnum.content} as "${CommentPropertyEnum.content}"`,
  `c.${CommentPropertyEnum.userId} as "${CommentPropertyEnum.userId}"`,
  `c.${CommentPropertyEnum.postId} as "${CommentPropertyEnum.postId}"`,
  `c.${CommentPropertyEnum.createdAt} as "${CommentPropertyEnum.createdAt}"`,
];

export type CommentEntityRawDataType = {
  [CommentPropertyEnum.id]: number;
  [CommentPropertyEnum.content]: string;
  [CommentPropertyEnum.userId]: string;
  [CommentPropertyEnum.userLogin]: string;
  [CommentPropertyEnum.likesCount]: number;
  [CommentPropertyEnum.dislikesCount]: number;
  [CommentPropertyEnum.currentUserLikeStatus]: LikeStatusEnum;
  [CommentPropertyEnum.createdAt]: Date;
};
