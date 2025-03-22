import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';
import { Blog } from './blog.entity';

@Entity()
export class BlogBannedUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reason: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @Column()
  isBanned: boolean;

  @ManyToOne(() => User, (user: User) => user.blogBanned)
  @JoinColumn()
  user: User;
  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => Blog, (blog: Blog) => blog.bannedUsers)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;
  @Column({ nullable: false })
  blogId: number;

  static create(
    blogId: number,
    userId: number,
    reason: string,
    state: boolean,
  ): BlogBannedUserEntity {
    const currentDate = new Date();
    const bannedUser = new this();
    bannedUser.blogId = blogId;
    bannedUser.userId = userId;
    bannedUser.reason = reason;
    bannedUser.isBanned = state;
    bannedUser.createdAt = currentDate;
    bannedUser.updateAt = currentDate;

    return bannedUser;
  }

  banOrUnban(state: boolean, reason: string): void {
    this.isBanned = state;
    this.reason = reason;
    this.updateAt = new Date();
  }
}
