import { User } from '../../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';

export class UserOutputModel {
  @ApiProperty({
    description: 'User id',
    example: '1',
    type: String,
  })
  public id: string;
  @ApiProperty({
    description: 'Uniq user login',
    example: 'login',
    type: String,
  })
  public login: string;
  @ApiProperty({
    description: 'Uniq user email',
    example: 'email@mail.com',
    type: String,
  })
  public email: string;
  @ApiProperty({
    description: 'Creation date of the user account',
    example: '2023-01-01T00:00:00Z',
    type: String,
  })
  public createdAt: Date;
}

export class UserMeOutputModel {
  @ApiProperty({
    description: 'Uniq user login',
    example: 'login',
    type: String,
  })
  public login: string;
  @ApiProperty({
    description: 'Uniq user email',
    example: 'email@mail.com',
    type: String,
  })
  public email: string;
  @ApiProperty({
    description: 'User id',
    example: '1',
    type: String,
  })
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

export class UserOutputModelForSwagger extends BasePagination<UserOutputModel> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: UserOutputModel,
  })
  items: UserOutputModel;
}
