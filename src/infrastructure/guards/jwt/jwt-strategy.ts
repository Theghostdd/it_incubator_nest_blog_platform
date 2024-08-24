import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppSettings } from '../../../settings/app-setting';
import { JWTAccessTokenPayloadType } from '../../../base/types/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly appSettings: AppSettings) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.api.JWT_TOKENS.ACCESS_TOKEN.SECRET,
    });
  }

  async validate(
    payload: JWTAccessTokenPayloadType & { iat: number; exp: number },
  ): Promise<JWTAccessTokenPayloadType> {
    return { userId: payload.userId };
  }
}
