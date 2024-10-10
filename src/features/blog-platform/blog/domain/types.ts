export enum BlogPropertyEnum {
  'id' = 'id',
  'name' = 'name',
  'description' = 'description',
  'websiteUrl' = 'websiteUrl',
  'createdAt' = 'createdAt',
  'isMembership' = 'isMembership',
  'isActive' = 'isActive',
  'posts' = 'posts',
}

export const selectBlogProperty = [
  `b.${BlogPropertyEnum.id}`,
  `b.${BlogPropertyEnum.name}`,
  `b.${BlogPropertyEnum.description}`,
  `b.${BlogPropertyEnum.websiteUrl}`,
  `b.${BlogPropertyEnum.createdAt}`,
  `b.${BlogPropertyEnum.isMembership}`,
];
