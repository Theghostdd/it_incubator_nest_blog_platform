import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserConfirmation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: false })
  isConfirm: boolean;
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
  @Column({ unique: true, nullable: false })
  userId: number;
}
