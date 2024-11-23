import { User } from '../../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';

export class UserBanInfoOutputModel {
  @ApiProperty({
    description: 'User`s banned state',
    example: true,
    type: Boolean,
  })
  public isBanned: boolean;
  @ApiProperty({
    description: 'Date of banned user',
    example: '2023-01-01T00:00:00Z',
    nullable: true,
    type: String,
  })
  public banDate: string;
  @ApiProperty({
    description: 'Reason of banned user',
    example: 'Non-compliance with the rules',
    nullable: true,
    type: String,
  })
  public banReason: string;
}

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

  @ApiProperty({
    type: UserBanInfoOutputModel,
  })
  public banInfo: UserBanInfoOutputModel;
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
      banInfo: {
        isBanned: user.isBan,
        banDate:
          user.userBans.length > 0
            ? user.userBans[0]?.dateAt.toISOString() || null
            : null,
        banReason:
          user.userBans.length > 0 ? user.userBans[0]?.reason || null : null,
      },
    };
  }

  usersModel(users: User[]): UserOutputModel[] {
    return users.map((user: User) => {
      return {
        id: user.id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
        banInfo: {
          isBanned: user.isBan,
          banDate:
            user.isBan && user.userBans.length > 0
              ? user.userBans[0]?.dateAt.toISOString() || null
              : null,
          banReason:
            user.isBan && user.userBans.length > 0
              ? user.userBans[0]?.reason || null
              : null,
        },
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
