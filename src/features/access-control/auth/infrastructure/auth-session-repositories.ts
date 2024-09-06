import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthSession,
  AuthSessionDocumentType,
  AuthSessionModelType,
} from '../domain/auth-session.entity';
import { Types } from 'mongoose';

@Injectable()
export class AuthSessionRepositories {
  constructor(
    @InjectModel(AuthSession.name)
    private readonly authSessionModel: AuthSessionModelType,
  ) {}

  async save(session: AuthSessionDocumentType): Promise<void> {
    await session.save();
  }

  async delete(session: AuthSessionDocumentType): Promise<void> {
    await session.deleteOne();
  }

  async deleteSessions(ids: Types.ObjectId[]): Promise<void> {
    await this.authSessionModel.deleteMany({ _id: { $in: ids } });
  }

  async getSessionByDeviceId(
    deviceId: string,
  ): Promise<AuthSessionDocumentType | null> {
    return this.authSessionModel.findOne({ dId: deviceId });
  }

  async getSessionsByUserId(
    userId: string,
  ): Promise<AuthSessionDocumentType[] | null> {
    return this.authSessionModel.find({ userId: userId });
  }
}
