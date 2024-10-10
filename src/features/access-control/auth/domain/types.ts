export enum AuthSessionPropertyEnum {
  'deviceId' = 'deviceId',
  'ip' = 'ip',
  'deviceName' = 'deviceName',
  'issueAt' = 'issueAt',
  'expAt' = 'expAt',
  'isActive' = 'isActive',
  'user' = 'user',
  'userId' = 'userId',
}

export const selectAuthSessionProperty = [
  `u.${AuthSessionPropertyEnum.deviceId}`,
  `u.${AuthSessionPropertyEnum.ip}`,
  `u.${AuthSessionPropertyEnum.deviceName}`,
  `u.${AuthSessionPropertyEnum.issueAt}`,
  `u.${AuthSessionPropertyEnum.expAt}`,
  `u.${AuthSessionPropertyEnum.userId}`,
];

export enum UserRecoveryPasswordSessionPropertyEnum {
  'id' = 'id',
  'email' = 'email',
  'code' = 'code',
  'expAt' = 'expAt',
  'user' = 'user',
  'userId' = 'userId',
  'isActive' = 'isActive',
}

export const selectUserRecoveryPasswordSessionProperty = [
  `rps.${UserRecoveryPasswordSessionPropertyEnum.id}`,
  `rps.${UserRecoveryPasswordSessionPropertyEnum.email}`,
  `rps.${UserRecoveryPasswordSessionPropertyEnum.code}`,
  `rps.${UserRecoveryPasswordSessionPropertyEnum.expAt}`,
  `rps.${UserRecoveryPasswordSessionPropertyEnum.userId}`,
];
