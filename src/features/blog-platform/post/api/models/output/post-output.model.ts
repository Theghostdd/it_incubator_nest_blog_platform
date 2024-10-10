import { LikeStatusEnum } from '../../../../like/domain/type';
import {
  PostLastLikesRawDataType,
  PostRawDataType,
} from '../../../domain/types';

export class NewestLikesModel {
  constructor(
    public addedAt: string,
    public userId: string,
    public login: string,
  ) {}
}

class PostLikeInfoModel {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: LikeStatusEnum,
    public newestLikes: NewestLikesModel[],
  ) {}
}

export class PostOutputModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: PostLikeInfoModel,
  ) {}
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
