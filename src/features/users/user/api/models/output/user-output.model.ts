import { User } from '../../../domain/user.entity';

export class UserOutputModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: Date,
  ) {}
}

export class UserMeOutputModel {
  public login: string;
  public email: string;
  public userId: string;
}

export class UserMapperOutputModel {
  constructor() {}
  userModel(user: User): UserOutputModel {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  usersModel(users: User[]): UserOutputModel[] {
    return users.map((user: User) => {
      return {
        id: user.id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });
  }
  currentUserModel(user: User): UserMeOutputModel {
    return {
      login: user.login,
      email: user.email,
      userId: user.id.toString(),
    };
  }
}
