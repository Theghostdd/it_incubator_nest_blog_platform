import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';

@Entity()
export class RecoveryPasswordSession {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  code: string;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  expAt: Date;
  @Column({ default: true })
  isActive: boolean;
  @ManyToOne(() => User, (user: User) => user.userRecoveryPasswordSession)
  @JoinColumn()
  user: User;
  @Column()
  userId: number;

  static createRecoveryPasswordSession(
    email: string,
    code: string,
    expAt: Date,
    user: User,
  ): RecoveryPasswordSession {
    const recoveryPasswordSession = new this();
    recoveryPasswordSession.email = email;
    recoveryPasswordSession.code = code;
    recoveryPasswordSession.expAt = expAt;
    recoveryPasswordSession.isActive = true;
    recoveryPasswordSession.user = user;
    recoveryPasswordSession.userId = user.id;

    if (user.userRecoveryPasswordSession) {
      user.userRecoveryPasswordSession.push(recoveryPasswordSession);
      return recoveryPasswordSession;
    }
    user.userRecoveryPasswordSession = [];
    user.userRecoveryPasswordSession.push(recoveryPasswordSession);
    return recoveryPasswordSession;
  }

  deleteRecoveryPasswordSession(): void {
    this.isActive = false;
  }
}
