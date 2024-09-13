import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthSessionType } from '../../auth/domain/auth-session.entity';
import {
  SecurityDeviceOutputModelMapper,
  SecurityDevicesOutputModel,
} from '../api/models/security-devices-output.model';
import { JWTRefreshTokenPayloadType } from '../../../../base/types/types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    private readonly securityDeviceOutputModelMapper: SecurityDeviceOutputModelMapper,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getAllDevices(
    user: JWTRefreshTokenPayloadType & { iat: number; exp: number },
  ): Promise<SecurityDevicesOutputModel[]> {
    const query = `
      SELECT "as"."ip", "as"."deviceName", "as"."deviceId", "as"."issueAt"
      FROM ${tablesName.AUTH_SESSIONS} as "as"
      JOIN ${tablesName.USERS} as u
      ON "as"."userId" = u."id" AND u."isActive" = true
      WHERE "as"."userId" = $1 AND "as"."isActive" = true
    `;
    const sessions: AuthSessionType[] | null = await this.dataSource.query(
      query,
      [user.userId],
    );
    if (sessions.length <= 0) throw new NotFoundException();

    return this.securityDeviceOutputModelMapper.modelsMapper(sessions);
  }
}
