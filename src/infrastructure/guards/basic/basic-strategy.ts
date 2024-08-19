import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { appSettings } from '../../../settings/app-setting';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  async validate(login: string, password: string): Promise<boolean> {
    if (
      appSettings.staticSettings.superAdminAuth.login === login &&
      appSettings.staticSettings.superAdminAuth.password === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
