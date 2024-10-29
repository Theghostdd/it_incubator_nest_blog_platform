import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';

@Entity()
export class AuthSession {
  @Index()
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
  @Index()
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
    if (user.userAuthSessions) {
      user.userAuthSessions.push(session);
      return session;
    }
    user.userAuthSessions = [];
    user.userAuthSessions.push(session);
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
