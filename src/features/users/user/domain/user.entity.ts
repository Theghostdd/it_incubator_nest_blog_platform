import { UserInputModel } from '../api/models/input/user-input.model';
import { Injectable } from '@nestjs/common';

export class User {
  public login: string;
  public email: string;
  public password: string;
  public isActive: boolean;
  public createdAt: Date;
  public userConfirm: UserConfirmationModel;
}

class UserConfirmationModel {
  public isConfirm: boolean;
  public confirmationCode: string;
  public dataExpire: Date;
}

export type UserTableType = User & { id: number };

export type UserType = {
  login: string;
  email: string;
  password: string;
  createdAt: Date;
  userConfirm: UserConfirmationModel;
} & { id: number };

export type UserJoinType = {
  login: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  isConfirm: boolean;
  confirmationCode: string;
  dataExpire: Date;
} & { id: number };

@Injectable()
export class UserFactory {
  constructor() {}
  create(userInputModel: UserInputModel, hash: string): User {
    const user = new User();
    const { login, email } = userInputModel;
    user.login = login;
    user.email = email;
    user.password = hash;
    user.createdAt = new Date();
    user.isActive = true;
    user.userConfirm = {
      isConfirm: true,
      confirmationCode: 'none',
      dataExpire: new Date(),
    };
    return user;
  }

  createRegistration(
    userInputModel: UserInputModel,
    hash: string,
    confirmationCode: string,
    dataExpire: Date,
  ): User {
    const user = new User();
    const { login, email } = userInputModel;
    user.login = login;
    user.email = email;
    user.password = hash;
    user.createdAt = new Date();
    user.isActive = true;
    user.userConfirm = {
      isConfirm: false,
      confirmationCode: confirmationCode,
      dataExpire: dataExpire,
    };
    return user;
  }
}
