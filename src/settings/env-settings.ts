import { EnvState } from './types/enum';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { EnvVariableType } from './types/types';
import { Trim } from '../core/decorators/transform/trim';

export class EnvSettings {
  @IsEnum(EnvState)
  public readonly ENV: EnvState;
  @Trim()
  @IsNotEmpty()
  @IsNumber()
  public readonly APP_PORT: number;
  @Trim()
  @IsNotEmpty()
  @IsNumber()
  public readonly PASSWORD_HASH_ROUNDS: number;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public readonly MONGO_CONNECTION_URI: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public readonly PASSWORD_MAIL_AGENT: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public readonly LOGIN_MAIL_AGENT: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public readonly JWT_ACCESS_TOKEN_SECRET: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public readonly JWT_REFRESH_TOKEN_SECRET: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public readonly SUPER_ADMIN_LOGIN: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public readonly SUPER_ADMIN_PASSWORD: string;

  constructor(envVariable: EnvVariableType) {
    this.ENV = (envVariable.ENV as EnvState) || EnvState.DEVELOPMENT;
    this.APP_PORT = this.getNumberOrDefaultValue(envVariable.APP_PORT, 3000);
    this.PASSWORD_HASH_ROUNDS = this.getNumberOrDefaultValue(
      envVariable.PASSWORD_HASH_ROUNDS,
      10,
    );
    this.MONGO_CONNECTION_URI =
      envVariable.MONGO_CONNECTION_URI || 'mongodb://localhost/blog_platform';
    this.PASSWORD_MAIL_AGENT = envVariable.PASSWORD_MAIL_AGENT;
    this.LOGIN_MAIL_AGENT = envVariable.LOGIN_MAIL_AGENT;
    this.JWT_ACCESS_TOKEN_SECRET = envVariable.JWT_ACCESS_TOKEN_SECRET;
    this.JWT_REFRESH_TOKEN_SECRET = envVariable.JWT_REFRESH_TOKEN_SECRET;
    this.SUPER_ADMIN_LOGIN = envVariable.SUPER_ADMIN_LOGIN;
    this.SUPER_ADMIN_PASSWORD = envVariable.SUPER_ADMIN_PASSWORD;
  }

  getEnvState() {
    return this.ENV;
  }

  isTestingState() {
    return this.ENV === EnvState.TESTING;
  }

  isProductionState() {
    return this.ENV === EnvState.PRODUCTION;
  }

  isDevelopmentState() {
    return this.ENV === EnvState.DEVELOPMENT;
  }

  isStagingState() {
    return this.ENV === EnvState.STAGING;
  }

  protected getNumberOrDefaultValue(value: string, defaultValue: number) {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      return defaultValue;
    }
    return parsedValue;
  }
}