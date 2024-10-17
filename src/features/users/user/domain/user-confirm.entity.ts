import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserConfirmation {
  @PrimaryGeneratedColumn()
  id: number;
  @Index()
  @Column({ default: false })
  isConfirm: boolean;
  @Index()
  @Column({ default: 'none' })
  confirmationCode: string;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataExpire: Date;
  @OneToOne(() => User, (user: User) => user.userConfirm)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Index()
  @Column({ unique: true, nullable: false })
  userId: number;
}
