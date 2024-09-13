import { Injectable } from '@nestjs/common';

export class AuthSession {
  deviceId: string;
  ip: string;
  deviceName: string;
  userId: number;
  issueAt: Date;
  expAt: Date;
}

export type AuthSessionType = AuthSession & { id: number };

@Injectable()
export class AuthSessionFactory {
  constructor() {}
  create(
    deviceId: string,
    ip: string,
    deviceName: string,
    userId: number,
    iatDate: Date,
    expDate: Date,
  ): AuthSession {
    const session = new AuthSession();
    session.deviceId = deviceId;
    session.ip = ip;
    session.deviceName = deviceName;
    session.userId = userId;
    session.issueAt = iatDate;
    session.expAt = expDate;
    return session;
  }
}
