import { Injectable, NotFoundException } from '@nestjs/common';
import {
  SecurityDeviceOutputModelMapper,
  SecurityDevicesOutputModel,
} from '../api/models/security-devices-output.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTRefreshTokenPayloadType } from '../../../../base/types/types';
import {
  AuthSession,
  AuthSessionPropertyEnum,
} from '../../auth/domain/auth-session.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    private readonly securityDeviceOutputModelMapper: SecurityDeviceOutputModelMapper,
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
  ) {}

  async getAllDevices(
    user: JWTRefreshTokenPayloadType & { iat: number; exp: number },
  ): Promise<SecurityDevicesOutputModel[]> {
    const sessions: AuthSession[] | [] = await this.authSessionRepository.find({
      where: {
        [AuthSessionPropertyEnum.userId]: user.userId,
        [AuthSessionPropertyEnum.isActive]: true,
      },
    });

    if (sessions.length < 1) throw new NotFoundException();

    return this.securityDeviceOutputModelMapper.modelsMapper(sessions);
  }
}
