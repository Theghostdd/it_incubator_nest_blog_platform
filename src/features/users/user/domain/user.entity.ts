import { UserInputModel } from '../api/models/input/user-input.model';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserConfirmation } from './user-confirm.entity';
import { RecoveryPasswordSession } from '../../../access-control/auth/domain/recovery-session.entity';
import { AuthSession } from '../../../access-control/auth/domain/auth-session.entity';
import { Comment } from '../../../blog-platform/comment/domain/comment.entity';
import { PostLike } from '../../../blog-platform/like/domain/post-like.entity';
import { CommentLike } from '../../../blog-platform/like/domain/comment-like.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @OneToOne(
    () => UserConfirmation,
    (userConfirmation: UserConfirmation) => userConfirmation.user,
    { cascade: true },
  )
  userConfirm: UserConfirmation;
  @OneToMany(
    () => RecoveryPasswordSession,
    (recoveryPasswordSession: RecoveryPasswordSession) =>
      recoveryPasswordSession.user,
  )
  userRecoveryPasswordSession: RecoveryPasswordSession[];
  @OneToMany(
    () => AuthSession,
    (recoveryPasswordSession: AuthSession) => recoveryPasswordSession.user,
  )
  userAuthSessions: AuthSession[];

  @OneToMany(() => PostLike, (like: PostLike) => like.user)
  userPostLike: PostLike[];

  @OneToMany(() => CommentLike, (like: CommentLike) => like.user)
  userCommentLike: CommentLike[];

  @OneToMany(() => Comment, (comment: Comment) => comment.user)
  userComments: Comment[];

  static createUser(
    userInputModel: UserInputModel,
    createdAt: Date,
    hash: string,
  ): User {
    const user = new this();
    const userConfirm = new UserConfirmation();
    const { login, email } = userInputModel;
    user.login = login;
    user.email = email;
    user.password = hash;
    user.createdAt = createdAt;
    user.isActive = true;
    user.userConfirm = userConfirm;

    userConfirm.user = user;
    userConfirm.isConfirm = true;
    userConfirm.confirmationCode = 'none';
    userConfirm.dataExpire = createdAt;
    return user;
  }

  static registrationUser(
    userInputModel: UserInputModel,
    hash: string,
    confirmationCode: string,
    createdAt: Date,
    dataExpire: Date,
  ): User {
    const user = new this();
    const userConfirm = new UserConfirmation();
    const { login, email } = userInputModel;
    user.login = login;
    user.email = email;
    user.password = hash;
    user.createdAt = createdAt;
    user.isActive = true;
    user.userConfirm = userConfirm;

    userConfirm.user = user;
    userConfirm.isConfirm = false;
    userConfirm.confirmationCode = confirmationCode;
    userConfirm.dataExpire = dataExpire;
    return user;
  }

  confirmEmail(): void {
    this.userConfirm.isConfirm = true;
  }

  updateConfirmationCode(newCode: string, dateExpireConfirmCode: Date): void {
    this.userConfirm.confirmationCode = newCode;
    this.userConfirm.dataExpire = dateExpireConfirmCode;
  }

  changePassword(newPassword: string): void {
    this.password = newPassword;
  }

  deleteUser(): void {
    this.isActive = false;
  }
}
