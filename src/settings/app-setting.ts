import { config } from 'dotenv';
import { SuperAdminAuth, ValidationOption } from './app-static-settings';
config();

export type EnvironmentVariable = { [key: string]: string | undefined };
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

export class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
    public staticSettings: ValidationOption,
    public superAdminAuth: SuperAdminAuth,
  ) {}
}

class APISettings {
  public readonly APP_PORT: number;
  public readonly PASSWORD_HASH_ROUNDS: number;
  public readonly MONGO_CONNECTION_URI: string;
  constructor(private readonly envVariables: EnvironmentVariable) {
    this.APP_PORT = this.getNumberOrDefault(envVariables.APP_PORT, 3000);
    this.PASSWORD_HASH_ROUNDS = this.getNumberOrDefault(
      envVariables.HASH_ROUNDS,
      10,
    );
    this.MONGO_CONNECTION_URI =
      envVariables.MONGO_CONNECTION_URI ?? 'mongodb://localhost/blog_platform';
  }

  private getNumberOrDefault(value: string, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env = new EnvironmentSettings(
  (Environments.includes(process.env.ENV?.trim())
    ? process.env.ENV.trim()
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);
const staticSettings = new ValidationOption();
const superAdminAuth = new SuperAdminAuth();
export const appSettings = new AppSettings(
  env,
  api,
  staticSettings,
  superAdminAuth,
);
