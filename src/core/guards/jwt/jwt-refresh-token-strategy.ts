import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { JWTRefreshTokenPayloadType } from '../../../base/types/types';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategyStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.refreshToken;
          if (!token) {
            throw new UnauthorizedException('Refresh token not found');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('apiSettings', { infer: true }).JWT_TOKENS
        .REFRESH_TOKEN.SECRET,
    });
  }

  async validate(
    payload: JWTRefreshTokenPayloadType & { iat: number; exp: number },
  ): Promise<JWTRefreshTokenPayloadType & { iat: number; exp: number }> {
    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
