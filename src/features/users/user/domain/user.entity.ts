import { UserInputModel } from '../api/models/input/user-input.model';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserConfirmation } from './user-confirm.entity';

export enum UserPropertyEnum {
  'id' = 'id',
  'login' = 'login',
  'email' = 'email',
  'password' = 'password',
  'isActive' = 'isActive',
  'createdAt' = 'createdAt',
  'userConfirm' = 'userConfirm',
}

export const selectUserProperty = [
  `u.${UserPropertyEnum.id}`,
  `u.${UserPropertyEnum.email}`,
  `u.${UserPropertyEnum.login}`,
  `u.${UserPropertyEnum.createdAt}`,
  `u.${UserPropertyEnum.password}`,
];

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
