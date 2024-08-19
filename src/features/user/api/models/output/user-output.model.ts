import { UserDocumentType } from '../../../domain/user.entity';

export class UserOutputModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
  ) {}
}

export class UserMeOutputModel {
  public login: string;
  public email: string;
  public userId: string;
}

export class UserMapperOutputModel {
  constructor() {}
  userModel(user: UserDocumentType): UserOutputModel {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  usersModel(users: UserDocumentType[]): UserOutputModel[] {
    return users.map((user: UserDocumentType) => {
      return {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });
  }

  currentUserModel(user: UserDocumentType): UserMeOutputModel {
    return {
      login: user.login,
      email: user.email,
      userId: user._id.toString(),
    };
  }
}
