import { UserInputModel } from '../api/models/input/user-input.model';
import {
  Column,
  Entity,
  Index,
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
import { Player } from '../../../quiz-game/player/domain/quiz-game-player.entity';
import { Blog } from '../../../blog-platform/blog/domain/blog.entity';
import { UserBan } from './user-ban.entity';
import { BlogBannedUserEntity } from '../../../blog-platform/blog/domain/blog-banned-user.entity';

@Entity()
@Index(['login', 'email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Index()
  @Column()
  login: string;
  @Index()
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
  @Column({ default: false })
  isBan: boolean;

  @OneToMany(() => UserBan, (userBan: UserBan) => userBan.user)
  userBans: UserBan[];

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

  @OneToOne(() => Player, (player: Player) => player.user, { cascade: true })
  player: Player;

  @OneToMany(() => Blog, (blog: Blog) => blog.owner)
  blog: Blog[];

  //Banned user for blog
  @OneToMany(
    () => BlogBannedUserEntity,
    (bannedUser: BlogBannedUserEntity) => bannedUser.user,
  )
  blogBanned: BlogBannedUserEntity[];

  static createUser(
    userInputModel: UserInputModel,
    createdAt: Date,
    hash: string,
  ): User {
    const user = new this();
    const userConfirm = new UserConfirmation();
    const player = new Player();
    const { login, email } = userInputModel;
    player.user = user;
    user.player = player;
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
    const player = new Player();
    const userConfirm = new UserConfirmation();
    const { login, email } = userInputModel;
    player.user = user;
    user.player = player;
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

  deleteLastUserBan(): void {
    this.userBans[0].isActive = false;
  }

  banOrUnban(state: boolean, reason: string): void {
    this.isBan = state;

    const userBan: UserBan = new UserBan();
    userBan.user = this;
    userBan.userId = this.id;
    userBan.reason = reason;
    userBan.isActive = true;
    userBan.dateAt = new Date();

    this.userBans.push(userBan);
  }
}
