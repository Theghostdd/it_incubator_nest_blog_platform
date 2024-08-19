import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RecoveryPasswordSession,
  RecoveryPasswordSessionDocumentType,
  RecoveryPasswordSessionModelType,
} from '../domain/recovery-session.entity';

@Injectable()
export class RecoveryPasswordSessionRepositories {
  constructor(
    @InjectModel(RecoveryPasswordSession.name)
    private readonly recoveryPasswordSession: RecoveryPasswordSessionModelType,
  ) {}

  async save(session: RecoveryPasswordSessionDocumentType): Promise<void> {
    await session.save();
  }

  async delete(session: RecoveryPasswordSessionDocumentType): Promise<void> {
    await session.deleteOne();
  }

  async getSessionByCode(
    code: string,
  ): Promise<RecoveryPasswordSessionDocumentType | null> {
    return this.recoveryPasswordSession.findOne({ code: code });
  }
}
