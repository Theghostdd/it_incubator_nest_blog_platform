import { AppResult } from '../enum/app-result.enum';

export type AppResultType<T = null, D = null> = {
  data: T;
  errorField?: D;
  appResult: AppResult;
};

export type APIErrorsMessageType = {
  errorsMessages: APIErrorMessageType[];
};

export type APIErrorMessageType = {
  message: string;
  field: string;
};

export type AuthorizationUserResponseType = {
  accessToken: string;
  refreshToken: string;
};

export type JWTAccessTokenPayloadType = {
  userId: number;
};

export type JWTRefreshTokenPayloadType = {
  userId: number;
  deviceId: string;
};

export type MailTemplateType = {
  subject: string;
  html: string;
};

export type ClientInfoType = {
  ip: string | null;
  userAgent: string | null;
};
