import { LikeStatusEnum } from '../../../../like/domain/type';
import {
  PostLastLikesRawDataType,
  PostRawDataType,
} from '../../../domain/types';
import { ApiProperty } from '@nestjs/swagger';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';

export class NewestLikesModel {
  @ApiProperty({
    description: 'Date and time when the like was added or update',
    example: '2024-10-18T12:00:00Z',
    type: String,
  })
  public addedAt: string;

  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123456',
    type: String,
  })
  public userId: string;

  @ApiProperty({
    description: 'Uniq user login',
    example: 'user123',
    type: String,
  })
  public login: string;
}

class PostLikeInfoModel {
  @ApiProperty({
    description: 'Total number of likes on the post',
    example: 150,
    type: Number,
  })
  public likesCount: number;

  @ApiProperty({
    description: 'Total number of dislikes on the post',
    example: 10,
    type: Number,
  })
  public dislikesCount: number;

  @ApiProperty({
    description: 'The current status of the user regarding the post',
    enum: LikeStatusEnum,
    example: LikeStatusEnum.Like,
  })
  public myStatus: LikeStatusEnum;

  @ApiProperty({
    description: 'List of the most recent likes',
    type: [NewestLikesModel],
  })
  public newestLikes: NewestLikesModel[];
}

export class PostOutputModel {
  @ApiProperty({
    description: 'Unique identifier of the post',
    example: '123456',
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Title of the post',
    example: 'Understanding API Documentation',
    type: String,
  })
  public title: string;

  @ApiProperty({
    description: 'Short description of the post',
    example: 'This post explains how to write effective API documentation.',
    type: String,
  })
  public shortDescription: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'API documentation is crucial for developers...',
    type: String,
  })
  public content: string;

  @ApiProperty({
    description: 'Identifier of the blog that the post belongs to',
    example: '123456',
    type: String,
  })
  public blogId: string;

  @ApiProperty({
    description: 'Name of the blog that the post belongs to',
    example: 'Tech Insights',
    type: String,
  })
  public blogName: string;

  @ApiProperty({
    description: 'Date and time when the post was created',
    example: '2024-10-18T12:00:00Z',
    type: String,
  })
  public createdAt: string;

  @ApiProperty({
    description: 'Extended likes information of the post',
    type: PostLikeInfoModel,
  })
  public extendedLikesInfo: PostLikeInfoModel;
}

export class PostMapperOutputModel {
  constructor() {}
  postModel(post: PostRawDataType): PostOutputModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount ? +post.likesCount : 0,
        dislikesCount: post.dislikesCount ? +post.dislikesCount : 0,
        myStatus: post.currentUserStatusLike
          ? (post.currentUserStatusLike as LikeStatusEnum)
          : LikeStatusEnum.None,
        newestLikes: post.lastLikes
          ? post.lastLikes.map((lastLike: PostLastLikesRawDataType) => {
              return {
                addedAt: lastLike.lastUpdateAt,
                userId: lastLike.userId.toString(),
                login: lastLike.userLogin,
              };
            })
          : [],
      },
    };
  }

  postsModel(posts: PostRawDataType[] | []): PostOutputModel[] {
    return posts.map((post: PostRawDataType) => {
      return {
        id: post.id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: post.blogName,
        createdAt: post.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: post.likesCount ? +post.likesCount : 0,
          dislikesCount: post.dislikesCount ? +post.dislikesCount : 0,
          myStatus: post.currentUserStatusLike
            ? (post.currentUserStatusLike as LikeStatusEnum)
            : LikeStatusEnum.None,
          newestLikes: post.lastLikes
            ? post.lastLikes.map((lastLike: PostLastLikesRawDataType) => {
                return {
                  addedAt: lastLike.lastUpdateAt,
                  userId: lastLike.userId.toString(),
                  login: lastLike.userLogin,
                };
              })
            : [],
        },
      };
    });
  }
}

export class PostOutputModelForSwagger extends BasePagination<PostOutputModel> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: PostOutputModel,
  })
  items: PostOutputModel;
}
