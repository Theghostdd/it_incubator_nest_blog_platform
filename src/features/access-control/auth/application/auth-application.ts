import { Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RecoveryPasswordSessionDocumentType } from '../domain/recovery-session.entity';
import { RecoveryPasswordSessionRepositories } from '../infrastructure/recovery-password-session-repositories';
import { ConfigService } from '@nestjs/config';
import { StaticOptions } from '../../../../settings/app-static-settings';
import { EnvSettings } from '../../../../settings/env-settings';
import { APISettings } from '../../../../settings/api-settings';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
  JWTRefreshTokenPayloadType,
} from '../../../../base/types/types';
import { format } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly staticOptions: StaticOptions;
  private readonly envSettings: EnvSettings;
  private readonly apiSettings: APISettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly jwtService: JwtService,
    private readonly recoveryPasswordSessionRepositories: RecoveryPasswordSessionRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @Inject('UUID') private readonly uuidv4: () => string,
  ) {
    this.envSettings = this.configService.get('environmentSettings', {
      infer: true,
    });
    this.apiSettings = this.configService.get('apiSettings', { infer: true });
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

  generateUuidCode(prefix: string, key: string): string {
    return `${prefix}-${this.uuidv4()}-${key}`;
  }

  generateDeviceId(userId: string): string {
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

  async recoveryPasswordSessionIsExistByCode(
    code: string,
  ): Promise<AppResultType<RecoveryPasswordSessionDocumentType | null>> {
    const recoveryPasswordSession: RecoveryPasswordSessionDocumentType | null =
      await this.recoveryPasswordSessionRepositories.getSessionByCode(code);

    if (!recoveryPasswordSession)
      return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(recoveryPasswordSession);
  }
}
