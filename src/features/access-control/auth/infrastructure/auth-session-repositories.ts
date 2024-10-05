import { Injectable } from '@nestjs/common';
import {
  AuthSession,
  AuthSessionPropertyEnum,
} from '../domain/auth-session.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { tablesName } from '../../../../core/utils/tables/tables';

@Injectable()
export class AuthSessionRepositories {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
  ) {}

  async save(session: AuthSession): Promise<void> {
    await this.authSessionRepository.save(session);
  }

  async deleteSessions(deviceIds: string[]): Promise<void> {
    const placeholders = deviceIds
      .map((_, index) => `$${index + 1}`)
      .join(', ');

    const query = `
      UPDATE ${tablesName.AUTH_SESSIONS}
      SET "isActive" = false
      WHERE "deviceId" IN (${placeholders})
    `;
    await this.dataSource.query(query, [...deviceIds]);
  }

  async getSessionByDeviceId(deviceId: string): Promise<AuthSession | null> {
    return await this.authSessionRepository.findOne({
      where: {
        [AuthSessionPropertyEnum.deviceId]: deviceId,
        [AuthSessionPropertyEnum.isActive]: true,
      },
    });
  }

  async getSessionsByUserId(userId: number): Promise<AuthSession[] | null> {
    return await this.authSessionRepository.find({
      where: {
        [AuthSessionPropertyEnum.userId]: userId,
        [AuthSessionPropertyEnum.isActive]: true,
      },
    });
  }
}
