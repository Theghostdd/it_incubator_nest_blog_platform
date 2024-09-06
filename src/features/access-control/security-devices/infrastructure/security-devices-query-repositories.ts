import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthSession,
  AuthSessionDocumentType,
  AuthSessionModelType,
} from '../../auth/domain/auth-session.entity';
import {
  SecurityDeviceOutputModelMapper,
  SecurityDevicesOutputModel,
} from '../api/models/security-devices-output.model';
import { JWTRefreshTokenPayloadType } from '../../../../base/types/types';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(AuthSession.name)
    private readonly authSessionModel: AuthSessionModelType,
    private readonly securityDeviceOutputModelMapper: SecurityDeviceOutputModelMapper,
  ) {}

  async getAllDevices(
    user: JWTRefreshTokenPayloadType & { iat: number; exp: number },
  ): Promise<SecurityDevicesOutputModel[]> {
    const sessions: AuthSessionDocumentType[] | null =
      await this.authSessionModel.find({ userId: user.userId });
    if (sessions.length <= 0) throw new NotFoundException();

    return this.securityDeviceOutputModelMapper.modelsMapper(sessions);
  }
}
