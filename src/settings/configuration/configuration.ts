import { ValidateNested, validateSync } from 'class-validator';
import { APISettings } from '../api-settings';
import { EnvSettings } from '../env-settings';
import { StaticOptions } from '../app-static-settings';
import { EnvVariableType } from '../types/types';

export type ConfigurationType = Configuration;
export class Configuration {
  apiSettings: APISettings;
  @ValidateNested()
  environmentSettings: EnvSettings;
  public staticSettings: StaticOptions;
  private constructor(configuration: Configuration) {
    Object.assign(this, configuration);
  }

  static createConfig(environmentVariables: EnvVariableType): Configuration {
    const environmentSettings = new EnvSettings(environmentVariables);
    const apiSettings = new APISettings(environmentSettings);
    const staticSettings = new StaticOptions();
    return new this({
      environmentSettings,
      apiSettings,
      staticSettings,
    });
  }
}

export function validate(environmentVariables: EnvVariableType) {
  const config = Configuration.createConfig(environmentVariables);
  const errors = validateSync(config, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return config;
}

export default () => {
  const environmentVariables = process.env as EnvVariableType;
  return Configuration.createConfig(environmentVariables);
};
