export enum UserPropertyEnum {
  'id' = 'id',
  'login' = 'login',
  'email' = 'email',
  'password' = 'password',
  'isActive' = 'isActive',
  'createdAt' = 'createdAt',
  'userConfirm' = 'userConfirm',
  'userRecoveryPasswordSession' = 'userRecoveryPasswordSession',
  'userAuthSessions' = 'userAuthSessions',
  'userLikes' = 'userLikes',
  'userComments' = 'userComments',
  'userId' = 'userId',
}

export const selectUserProperty = [
  `u.${UserPropertyEnum.id}`,
  `u.${UserPropertyEnum.email}`,
  `u.${UserPropertyEnum.login}`,
  `u.${UserPropertyEnum.createdAt}`,
  `u.${UserPropertyEnum.password}`,
];

export enum UserConfirmationPropertyEnum {
  'id' = 'id',
  'isConfirm' = 'isConfirm',
  'confirmationCode' = 'confirmationCode',
  'dataExpire' = 'dataExpire',
  'user' = 'user',
  'userId' = 'userId',
}

export const selectUserConfirmationProperty = [
  `uc.${UserConfirmationPropertyEnum.id}`,
  `uc.${UserConfirmationPropertyEnum.userId}`,
  `uc.${UserConfirmationPropertyEnum.isConfirm}`,
  `uc.${UserConfirmationPropertyEnum.confirmationCode}`,
  `uc.${UserConfirmationPropertyEnum.dataExpire}`,
];
