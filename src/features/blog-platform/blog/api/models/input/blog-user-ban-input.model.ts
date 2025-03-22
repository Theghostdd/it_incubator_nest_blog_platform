import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { BaseSorting } from '../../../../../../base/sorting/base-sorting';

export class BlogUserBanInputModel {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  banReason: string;
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  blogId: string;
}

export class BlogBannedUserSortingQuery extends BaseSorting {
  @ApiProperty({
    description: 'The login term to search',
    example: 'blog123456',
    type: String,
    required: false,
  })
  public readonly searchLoginTerm: string;

  constructor() {
    super();
  }

  public createBlogBannedUserQuery(query: BlogBannedUserSortingQuery) {
    const baseQuery = this.createBaseQuery(query);
    return {
      ...baseQuery,
      searchLoginTerm: query?.searchLoginTerm ?? '',
    };
  }
}
