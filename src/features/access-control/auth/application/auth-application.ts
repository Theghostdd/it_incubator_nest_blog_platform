import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RecoveryPasswordSessionRepositories } from '../infrastructure/recovery-password-session-repositories';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';
import { AuthSessionType } from '../domain/auth-session.entity';
import { AuthSessionRepositories } from '../infrastructure/auth-session-repositories';
import { RecoveryPasswordSession } from '../domain/recovery-session.entity';
import { APISettings } from '../../../../settings/api-settings';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
  JWTRefreshTokenPayloadType,
} from '../../../../base/types/types';

@Injectable()
export class AuthService {
  private readonly apiSettings: APISettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly jwtService: JwtService,
    private readonly recoveryPasswordSessionRepositories: RecoveryPasswordSessionRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly authSessionRepositories: AuthSessionRepositories,
    @Inject('UUID') private readonly uuidv4: () => string,
  ) {
    this.apiSettings = this.configService.get('apiSettings', { infer: true });
  }

  generateUuidCode(prefix: string, key: string): string {
    return `${prefix}-${this.uuidv4()}-${key}`;
  }

  generateDeviceId(userId: number): string {
    return (
      this.uuidv4().slice(0, 20) +
      `${format(new Date(), '-dd-MM-yyyy-HH-mm-ss')}-${this.uuidv4().slice(0, 10)}-${userId}`
    );
  }

  async generateAccessToken(payload: JWTAccessTokenPayloadType) {
    return await this.jwtService.signAsync(payload, {
      secret: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.SECRET,
      expiresIn: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.EXPIRES,
    });
  }

  async generateRefreshToken(payload: JWTRefreshTokenPayloadType) {
    return await this.jwtService.signAsync(payload, {
      secret: this.apiSettings.JWT_TOKENS.REFRESH_TOKEN.SECRET,
      expiresIn: this.apiSettings.JWT_TOKENS.REFRESH_TOKEN.EXPIRES,
    });
  }

  async decodeJWTToken<T>(token: string): Promise<T> {
    return await this.jwtService.decode(token);
  }

  async getRecoveryPasswordSessionByCode(
    code: string,
  ): Promise<AppResultType<RecoveryPasswordSession | null>> {
    const recoveryPasswordSession: RecoveryPasswordSession | null =
      await this.recoveryPasswordSessionRepositories.getSessionByCode(code);

    if (!recoveryPasswordSession)
      return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(recoveryPasswordSession);
  }

  async getAuthSessionByDeviceId(
    deviceId: string,
  ): Promise<AppResultType<AuthSessionType | null>> {
    const authSession: AuthSessionType | null =
      await this.authSessionRepositories.getSessionByDeviceId(deviceId);

    if (!authSession) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(authSession);
  }
}
