import bcrypt from 'bcrypt';
import { EnvSettings } from '../../../settings/env-settings';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService {
  private envSettings: EnvSettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.envSettings = this.configService.get('environmentSettings', {
      infer: true,
    });
  }

  async generatePasswordHashAndSalt(password: string): Promise<string> {
    return await bcrypt.hash(password, this.envSettings.PASSWORD_HASH_ROUNDS);
  }

  async comparePasswordHashAndSalt(
    password: string,
    existingPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, existingPassword);
  }
}
