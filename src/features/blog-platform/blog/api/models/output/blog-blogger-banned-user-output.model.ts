import { ApiProperty } from '@nestjs/swagger';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';
import { Injectable } from '@nestjs/common';
import { BlogBannedUserEntity } from '../../../domain/blog-banned-user.entity';

export class BlogBloggerBannedUserBanInfoOutputModel {
  @ApiProperty()
  isBanned: boolean;

  @ApiProperty()
  banDate: string;

  @ApiProperty()
  banReason: string;
}

export class BlogBloggerBannedUserOutputModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  banInfo: BlogBloggerBannedUserBanInfoOutputModel;
}

export class PaginationBlogBloggerBannedUserOutputModel extends BasePagination<
  BlogBloggerBannedUserOutputModel[]
> {
  @ApiProperty({ isArray: true, type: BlogBloggerBannedUserOutputModel })
  items: BlogBloggerBannedUserOutputModel[];
}

@Injectable()
export class BlogBloggerBannedUserOutputMapper {
  mapBannedUserOutputModel(
    bannedUser: BlogBannedUserEntity,
  ): BlogBloggerBannedUserOutputModel {
    return {
      id: bannedUser.user.id.toString(),
      login: bannedUser.user.login,
      banInfo: {
        banDate: bannedUser.updateAt.toISOString(),
        banReason: bannedUser.reason,
        isBanned: bannedUser.isBanned,
      },
    };
  }

  mapBannedUsersOutputModel(
    bannedUsers: BlogBannedUserEntity[],
  ): BlogBloggerBannedUserOutputModel[] {
    return bannedUsers.map((u) => this.mapBannedUserOutputModel(u));
  }
}
