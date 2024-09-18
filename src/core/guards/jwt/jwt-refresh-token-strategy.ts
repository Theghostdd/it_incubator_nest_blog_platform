import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../settings/configuration/configuration';
import { JWTRefreshTokenPayloadType } from '../../../base/types/types';
import { Request } from 'express';
import { AuthSessionRepositories } from '../../../features/access-control/auth/infrastructure/auth-session-repositories';
import { AuthSessionType } from '../../../features/access-control/auth/domain/auth-session.entity';

@Injectable()
export class JwtRefreshTokenStrategyStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly authSessionRepositories: AuthSessionRepositories,
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
    const session: AuthSessionType | null =
      await this.authSessionRepositories.getSessionByDeviceId(payload.deviceId);

    if (!session) return null;
    if (
      session.issueAt.toISOString() !==
      new Date(payload.iat * 1000).toISOString()
    )
      return null;

    if (session.userId !== payload.userId) return null;

    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
