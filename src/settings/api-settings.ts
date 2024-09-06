import { EnvSettings } from './env-settings';
import {
  JWTTokensSettingsType,
  NodeMailerSettingsType,
  SuperAdminAuthType,
} from './types/types';

export class APISettings {
  public readonly JWT_TOKENS: JWTTokensSettingsType;
  public readonly NODEMAILER: NodeMailerSettingsType;
  public readonly SUPER_ADMIN_AUTH: SuperAdminAuthType;

  constructor(env: EnvSettings) {
    this.JWT_TOKENS = this.initJwtSettings(
      env.JWT_ACCESS_TOKEN_SECRET,
      env.JWT_REFRESH_TOKEN_SECRET,
    );

    this.NODEMAILER = this.initNodemailerSettings(
      env.LOGIN_MAIL_AGENT,
      env.PASSWORD_MAIL_AGENT,
    );

    this.SUPER_ADMIN_AUTH = this.initSuperAdminAuthSettings(
      env.SUPER_ADMIN_LOGIN,
      env.SUPER_ADMIN_PASSWORD,
    );
  }

  private initJwtSettings(
    aSecret: string,
    rSecret: string,
  ): JWTTokensSettingsType {
    return {
      ACCESS_TOKEN: {
        SECRET: aSecret,
        EXPIRES: '10s',
      },
      REFRESH_TOKEN: {
        SECRET: rSecret,
        EXPIRES: '20s',
      },
    };
  }

  private initNodemailerSettings(
    login: string,
    password: string,
  ): NodeMailerSettingsType {
    return {
      MAIL_SERVICE: 'gmail',
      MAIL_HOST: 'smtp.gmail.com',
      MAIL_PORT: 465,
      MAIL_SECURE: true,
      MAIL_IGNORE_TLS: true,
      MAIL_AGENT_SETTINGS: {
        address: login,
        name: 'Mikhail',
        password: password,
      },
    };
  }

  private initSuperAdminAuthSettings(
    login: string,
    password: string,
  ): SuperAdminAuthType {
    return {
      login: login,
      password: password,
    };
  }
}
