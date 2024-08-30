import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { APISettings } from '../../../settings/api-settings';
import { Observable } from 'rxjs';

@Injectable()
export class VerifyUserGuard implements CanActivate {
  private apiSettings: APISettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly jwtService: JwtService,
  ) {
    this.apiSettings = this.configService.get('apiSettings', { infer: true });
  }
  canActivate(context: ExecutionContext): boolean | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (
      !request.headers.authorization ||
      request.headers.authorization.split(' ')[0] !== 'Bearer'
    ) {
      request.user = { userId: null };
      return true;
    }

    const token = request.headers.authorization.split(' ')[1];

    const jwtAccessPayload = this.jwtService.verify(token, {
      secret: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.SECRET,
    });
    request.user = {
      userId: jwtAccessPayload.userId,
    };
    return true;
  }
}
