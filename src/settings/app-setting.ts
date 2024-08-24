import { api, APISettings } from './api-settings';
import { env, EnvSettings } from './env-settings';
import { staticOptions, StaticOptions } from './app-static-settings';
import {
  ValidationOption,
  validationOptions,
} from './app-validation-option-settings';

export class AppSettings {
  constructor(
    public env: EnvSettings,
    public api: APISettings,
    public staticSettings: StaticOptions,
    public validationOptions: ValidationOption,
  ) {}
}

export const appSettings = new AppSettings(
  env,
  api,
  staticOptions,
  validationOptions,
);
