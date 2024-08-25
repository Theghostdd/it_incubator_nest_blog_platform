import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTAccessTokenPayloadType } from '../../../base/types/types';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('apiSettings', { infer: true }).JWT_TOKENS
        .ACCESS_TOKEN.SECRET,
    });
  }

  async validate(
    payload: JWTAccessTokenPayloadType & { iat: number; exp: number },
  ): Promise<JWTAccessTokenPayloadType> {
    return { userId: payload.userId };
  }
}
