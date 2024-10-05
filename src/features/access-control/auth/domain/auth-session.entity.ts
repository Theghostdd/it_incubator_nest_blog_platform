import { Injectable } from '@nestjs/common';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';

export enum AuthSessionPropertyEnum {
  'deviceId' = 'deviceId',
  'ip' = 'ip',
  'deviceName' = 'deviceName',
  'issueAt' = 'issueAt',
  'expAt' = 'expAt',
  'isActive' = 'isActive',
  'user' = 'user',
  'userId' = 'userId',
}

export const selectAuthSessionProperty = [
  `u.${AuthSessionPropertyEnum.deviceId}`,
  `u.${AuthSessionPropertyEnum.ip}`,
  `u.${AuthSessionPropertyEnum.deviceName}`,
  `u.${AuthSessionPropertyEnum.issueAt}`,
  `u.${AuthSessionPropertyEnum.expAt}`,
  `u.${AuthSessionPropertyEnum.userId}`,
];

@Entity()
export class AuthSession {
  @PrimaryColumn()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  deviceName: string;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  issueAt: Date;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  expAt: Date;
  @Column({ default: true })
  isActive: boolean;
  @ManyToOne(() => User, (user: User) => user.userAuthSessions)
  user: User;
  @Column()
  userId: number;

  static createAuthSession(
    deviceId: string,
    ip: string,
    deviceName: string,
    user: User,
    iatDate: Date,
    expDate: Date,
  ): AuthSession {
    const session = new this();
    session.deviceId = deviceId;
    session.ip = ip;
    session.deviceName = deviceName;
    session.user = user;
    session.userId = user.id;
    session.isActive = true;
    session.issueAt = iatDate;
    session.expAt = expDate;
    return session;
  }

  deleteAuthSession(): void {
    this.isActive = false;
  }

  updateAuthSession(iatDate: Date, expDate: Date): void {
    this.issueAt = iatDate;
    this.expAt = expDate;
  }
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
