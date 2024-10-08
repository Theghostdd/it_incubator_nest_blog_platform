import { Injectable } from '@nestjs/common';
import { RecoveryPasswordSession } from '../domain/recovery-session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRecoveryPasswordSessionPropertyEnum } from '../domain/types';

@Injectable()
export class RecoveryPasswordSessionRepositories {
  constructor(
    @InjectRepository(RecoveryPasswordSession)
    private readonly recoveryPasswordSessionRepository: Repository<RecoveryPasswordSession>,
  ) {}

  async save(session: RecoveryPasswordSession): Promise<void> {
    await this.recoveryPasswordSessionRepository.save(session);
  }

  async getSessionByCode(
    code: string,
  ): Promise<RecoveryPasswordSession | null> {
    return await this.recoveryPasswordSessionRepository.findOne({
      where: {
        [UserRecoveryPasswordSessionPropertyEnum.code]: code,
        [UserRecoveryPasswordSessionPropertyEnum.isActive]: true,
      },
    });
  }
}
