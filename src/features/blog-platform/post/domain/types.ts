import { LikePropertyEnum } from '../../like/domain/type';

export enum PostPropertyEnum {
  'id' = 'id',
  'title' = 'title',
  'shortDescription' = 'shortDescription',
  'content' = 'content',
  'createdAt' = 'createdAt',
  'isActive' = 'isActive',
  'blog' = 'blog',
  'blogId' = 'blogId',
  'blogName' = 'blogName',
  'likesCount' = 'likesCount',
  'dislikesCount' = 'dislikesCount',
  'comments' = 'comments',
  'likes' = 'likes',
  'currentUserStatusLike' = 'currentUserStatusLike',
  'lastLikes' = 'lastLikes',
}

export const selectPostProperty = [
  `p.${PostPropertyEnum.id} as "${PostPropertyEnum.id}"`,
  `p.${PostPropertyEnum.title} as "${PostPropertyEnum.title}"`,
  `p.${PostPropertyEnum.shortDescription} as "${PostPropertyEnum.shortDescription}"`,
  `p.${PostPropertyEnum.content} as "${PostPropertyEnum.content}"`,
  `p.${PostPropertyEnum.createdAt} as "${PostPropertyEnum.createdAt}"`,
  `p.${PostPropertyEnum.blogId} as "${PostPropertyEnum.blogId}"`,
];

export type PostLastLikesRawDataType = {
  [LikePropertyEnum.status]: string;
  [LikePropertyEnum.userId]: string;
  [LikePropertyEnum.userLogin]: string;
  [LikePropertyEnum.lastUpdateAt]: string;
};

export type PostRawDataType = {
  [PostPropertyEnum.id]: number;
  [PostPropertyEnum.title]: string;
  [PostPropertyEnum.shortDescription]: string;
  [PostPropertyEnum.content]: string;
  [PostPropertyEnum.createdAt]: Date;
  [PostPropertyEnum.blogId]: number;
  [PostPropertyEnum.blogName]: string;
  [PostPropertyEnum.currentUserStatusLike]: string;
  [PostPropertyEnum.likesCount]: string;
  [PostPropertyEnum.dislikesCount]: string;
  [PostPropertyEnum.lastLikes]: PostLastLikesRawDataType[] | null;
};
