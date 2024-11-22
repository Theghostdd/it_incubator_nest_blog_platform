import { Injectable } from '@nestjs/common';
import { AuthSession } from '../domain/auth-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { AuthSessionPropertyEnum } from '../domain/types';

@Injectable()
export class AuthSessionRepositories {
  constructor(
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
  ) {}

  async save(session: AuthSession): Promise<void> {
    await this.authSessionRepository.save(session);
  }

  async deleteManySessions(
    deviceIds: string[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager.update(
        this.authSessionRepository.target,
        {
          [AuthSessionPropertyEnum.deviceId]: In(deviceIds),
          [AuthSessionPropertyEnum.isActive]: true,
        },
        { [AuthSessionPropertyEnum.isActive]: false },
      );
      return;
    }
    await this.authSessionRepository.update(
      {
        [AuthSessionPropertyEnum.deviceId]: In(deviceIds),
        [AuthSessionPropertyEnum.isActive]: true,
      },
      { [AuthSessionPropertyEnum.isActive]: false },
    );
    return;
  }

  async getSessionByDeviceId(deviceId: string): Promise<AuthSession | null> {
    return await this.authSessionRepository.findOne({
      where: {
        [AuthSessionPropertyEnum.deviceId]: deviceId,
        [AuthSessionPropertyEnum.isActive]: true,
      },
    });
  }

  async getSessionsByUserId(
    userId: number,
    queryRunner?: QueryRunner,
  ): Promise<AuthSession[] | null> {
    if (queryRunner) {
      const sessions: AuthSession[] | [] = await queryRunner.manager.find(
        this.authSessionRepository.target,
        {
          where: {
            [AuthSessionPropertyEnum.userId]: userId,
            [AuthSessionPropertyEnum.isActive]: true,
          },
          lock: { mode: 'pessimistic_read' },
        },
      );
      return sessions.length > 0 ? sessions : null;
    }
    const sessions: AuthSession[] | [] = await this.authSessionRepository.find({
      where: {
        [AuthSessionPropertyEnum.userId]: userId,
        [AuthSessionPropertyEnum.isActive]: true,
      },
    });
    return sessions.length > 0 ? sessions : null;
  }
}
