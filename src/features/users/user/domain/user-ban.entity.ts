import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserBan {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  reason: string;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateAt: Date;
  @Column()
  isActive: boolean;

  @ManyToOne(() => User, (user: User) => user.userBans)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false })
  userId: number;
}
