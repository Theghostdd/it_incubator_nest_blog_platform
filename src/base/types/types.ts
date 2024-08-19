import { AppResult } from '../enum/app-result.enum';

export type AppResultType<T = null> = {
  data: T;
  errorField?: APIErrorsMessageType;
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
  userId: string;
};
