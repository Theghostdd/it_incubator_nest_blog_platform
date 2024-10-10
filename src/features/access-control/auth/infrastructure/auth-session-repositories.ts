import { Injectable } from '@nestjs/common';
import { AuthSession } from '../domain/auth-session.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AuthSessionPropertyEnum } from '../domain/types';

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

  async deleteManySessions(deviceIds: string[]): Promise<void> {
    await this.authSessionRepository.update(
      {
        [AuthSessionPropertyEnum.deviceId]: In(deviceIds),
        [AuthSessionPropertyEnum.isActive]: true,
      },
      { [AuthSessionPropertyEnum.isActive]: false },
    );
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
    const sessions: AuthSession[] | [] = await this.authSessionRepository.find({
      where: {
        [AuthSessionPropertyEnum.userId]: userId,
        [AuthSessionPropertyEnum.isActive]: true,
      },
    });
    return sessions.length > 0 ? sessions : null;
  }
}
