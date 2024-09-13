import { UserType } from '../../../domain/user.entity';

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
  userModel(user: UserType): UserOutputModel {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  usersModel(users: UserType[]): UserOutputModel[] {
    return users.map((user: UserType) => {
      return {
        id: user.id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });
  }
  currentUserModel(user: UserType): UserMeOutputModel {
    return {
      login: user.login,
      email: user.email,
      userId: user.id.toString(),
    };
  }
}
