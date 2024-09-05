import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthSession,
  AuthSessionDocumentType,
  AuthSessionModelType,
} from '../domain/auth-session.entity';

@Injectable()
export class AuthSessionRepositories {
  constructor(
    @InjectModel(AuthSession.name)
    private readonly authSession: AuthSessionModelType,
  ) {}

  async save(session: AuthSessionDocumentType): Promise<void> {
    await session.save();
  }

  async delete(session: AuthSessionDocumentType): Promise<void> {
    await session.deleteOne();
  }

  async getSessionByDeviceId(
    deviceId: string,
  ): Promise<AuthSessionDocumentType | null> {
    return this.authSession.findOne({ dId: deviceId });
  }
}
