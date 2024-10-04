import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum UserConfirmationPropertyEnum {
  'id' = 'id',
  'isConfirm' = 'isConfirm',
  'confirmationCode' = 'confirmationCode',
  'dataExpire' = 'dataExpire',
  'user' = 'user',
  'userId' = 'userId',
}

export const selectUserConfirmationProperty = [
  `uc.${UserConfirmationPropertyEnum.id}`,
  `uc.${UserConfirmationPropertyEnum.userId}`,
  `uc.${UserConfirmationPropertyEnum.isConfirm}`,
  `uc.${UserConfirmationPropertyEnum.confirmationCode}`,
  `uc.${UserConfirmationPropertyEnum.dataExpire}`,
];

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
  @Column({ unique: true })
  userId: number;
}
