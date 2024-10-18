import { LikeStatusEnum } from '../../../../like/domain/type';
import { CommentEntityRawDataType } from '../../../domain/types';
import { ApiProperty } from '@nestjs/swagger';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';

export class CommentatorInfoViewModel {
  @ApiProperty({
    description: 'Unique identifier of the user who commented',
    example: '123456',
    type: String,
  })
  public userId: string;

  @ApiProperty({
    description: 'Login of the user who commented',
    example: 'user123',
    type: String,
  })
  public userLogin: string;
}

export class CommentLikesInfoViewModel {
  @ApiProperty({
    description: 'Total number of likes on the comment',
    example: 150,
    type: Number,
  })
  public likesCount: number;

  @ApiProperty({
    description: 'Total number of dislikes on the comment',
    example: 10,
    type: Number,
  })
  public dislikesCount: number;

  @ApiProperty({
    description: 'The current status of the user regarding the comment',
    enum: LikeStatusEnum,
    example: LikeStatusEnum.Like,
  })
  public myStatus: LikeStatusEnum;
}

export class CommentOutputModel {
  @ApiProperty({
    description: 'Unique identifier of the comment',
    example: '123456',
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a very insightful post!',
    type: String,
  })
  public content: string;

  @ApiProperty({
    description: 'Information about the commentator',
    type: CommentatorInfoViewModel,
  })
  public commentatorInfo: CommentatorInfoViewModel;

  @ApiProperty({
    description: 'Likes information for the comment',
    type: CommentLikesInfoViewModel,
  })
  public likesInfo: CommentLikesInfoViewModel;

  @ApiProperty({
    description: 'Date and time when the comment was created',
    example: '2024-10-18T12:00:00Z',
    type: String,
  })
  public createdAt: string;
}

export class CommentMapperOutputModel {
  constructor() {}
  commentModel(comment: CommentEntityRawDataType): CommentOutputModel {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesCount ? +comment.likesCount : 0,
        dislikesCount: comment.dislikesCount ? +comment.dislikesCount : 0,
        myStatus: comment.currentUserLikeStatus
          ? comment.currentUserLikeStatus
          : LikeStatusEnum.None,
      },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  commentsModel(comments: CommentEntityRawDataType[]): CommentOutputModel[] {
    return comments.map((comment: CommentEntityRawDataType) => {
      return {
        id: comment.id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId.toString(),
          userLogin: comment.userLogin,
        },
        likesInfo: {
          likesCount: comment.likesCount ? +comment.likesCount : 0,
          dislikesCount: comment.dislikesCount ? +comment.dislikesCount : 0,
          myStatus: comment.currentUserLikeStatus
            ? comment.currentUserLikeStatus
            : LikeStatusEnum.None,
        },
        createdAt: comment.createdAt.toISOString(),
      };
    });
  }
}

export class CommentOutputModelForSwagger extends BasePagination<CommentOutputModel> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: CommentOutputModel,
  })
  items: CommentOutputModel;
}
