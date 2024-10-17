import { AppResult } from '../enum/app-result.enum';
import { ApiProperty } from '@nestjs/swagger';

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

export class ApiErrorMessageModel {
  @ApiProperty({
    description: 'Error message providing details about the issue',
    example: 'Invalid login credentials',
    type: String,
  })
  public message: string;

  @ApiProperty({
    description: 'The field associated with the error',
    example: 'login',
    type: String,
  })
  public field: string;
}

export class ApiErrorsMessageModel {
  @ApiProperty({
    description: 'Error array',
    isArray: true,
    type: ApiErrorMessageModel,
  })
  errorsMessages: ApiErrorMessageModel[];
}
