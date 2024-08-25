import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { APISettings } from '../../../settings/api-settings';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  private apiSettings: APISettings;
  constructor(private configService: ConfigService<ConfigurationType, true>) {
    super();
    this.apiSettings = this.configService.get('apiSettings', {
      infer: true,
    });
  }
  async validate(login: string, password: string): Promise<boolean> {
    if (
      this.apiSettings.SUPER_ADMIN_AUTH.login === login &&
      this.apiSettings.SUPER_ADMIN_AUTH.password === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
