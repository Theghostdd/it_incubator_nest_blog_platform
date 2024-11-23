import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { APISettings } from '../../../settings/api-settings';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
} from '../../../base/types/types';
import { UserService } from '../../../features/users/user/application/user-service';
import { User } from '../../../features/users/user/domain/user.entity';
import { AppResult } from '../../../base/enum/app-result.enum';

@Injectable()
export class VerifyUserGuard implements CanActivate {
  private apiSettings: APISettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.apiSettings = this.configService.get('apiSettings', { infer: true });
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (
      !request.headers.authorization ||
      request.headers.authorization.split(' ')[0] !== 'Bearer'
    ) {
      request.user = { userId: null };
      return true;
    }

    const token = request.headers.authorization.split(' ')[1];
    let jwtAccessPayload: JWTAccessTokenPayloadType;
    try {
      jwtAccessPayload = this.jwtService.verify(token, {
        secret: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.SECRET,
      });

      const user: AppResultType<User | null> =
        await this.userService.getUserById(jwtAccessPayload.userId);
      if (user.appResult !== AppResult.Success) return true;
      if (user.data.isBan) return true;
    } catch (e) {
      request.user = { userId: null };
      return true;
    }

    request.user = {
      userId: jwtAccessPayload.userId,
    };
    return true;
  }
}
