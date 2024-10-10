export enum LikeStatusEnum {
  'None' = 'None',
  'Like' = 'Like',
  'Dislike' = 'Dislike',
}

export enum LikePropertyEnum {
  'id' = 'id',
  'entityType' = 'entityType',
  'status' = 'status',
  'createdAt' = 'createdAt',
  'lastUpdateAt' = 'lastUpdateAt',
  'user' = 'user',
  'userId' = 'userId',
  'userLogin' = 'userLogin',
  'parent' = 'parent',
  'parentId' = 'parentId',
}

export const selectLikeProperty = [
  `l.${LikePropertyEnum.id}`,
  `l.${LikePropertyEnum.status}`,
  `l.${LikePropertyEnum.createdAt}`,
  `l.${LikePropertyEnum.lastUpdateAt}`,
  `l.${LikePropertyEnum.userId}`,
  `l.${LikePropertyEnum.parentId}`,
];
