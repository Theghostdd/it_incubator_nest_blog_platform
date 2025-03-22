export enum BlogPropertyEnum {
  'id' = 'id',
  'name' = 'name',
  'description' = 'description',
  'websiteUrl' = 'websiteUrl',
  'createdAt' = 'createdAt',
  'isMembership' = 'isMembership',
  'isActive' = 'isActive',
  'posts' = 'posts',
  'owner' = 'owner',
  'ownerId' = 'ownerId',
}

export const selectBlogProperty = [
  `b.${BlogPropertyEnum.id}`,
  `b.${BlogPropertyEnum.name}`,
  `b.${BlogPropertyEnum.description}`,
  `b.${BlogPropertyEnum.websiteUrl}`,
  `b.${BlogPropertyEnum.createdAt}`,
  `b.${BlogPropertyEnum.isMembership}`,
  `b.${BlogPropertyEnum.ownerId}`,
];

export enum BlogBannedUserPropertyEnum {
  'id' = 'id',
  'reason' = 'reason',
  'createdAt' = 'createdAt',
  'updateAt' = 'updateAt',
  'isBanned' = 'isBanned',
  'user' = 'user',
  'userId' = 'userId',
  'blog' = 'blog',
  'blogId' = 'blogId',
}

export const selectBlogBannedUserProperty = [
  `bbu.${BlogBannedUserPropertyEnum.id}`,
  `bbu.${BlogBannedUserPropertyEnum.reason}`,
  `bbu.${BlogBannedUserPropertyEnum.createdAt}`,
  `bbu.${BlogBannedUserPropertyEnum.updateAt}`,
  `bbu.${BlogBannedUserPropertyEnum.isBanned}`,
  `bbu.${BlogBannedUserPropertyEnum.userId}`,
  `bbu.${BlogBannedUserPropertyEnum.blogId}`,
];
