import { LikeStatusEnum } from '../../../../../base/enum/enum';
import { PostDocumentType } from '../../../domain/post.entity';

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
  postModel(
    post: PostDocumentType,
    userStatusLike: LikeStatusEnum,
    newestLikesArray: NewestLikesModel[],
  ): PostOutputModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: !userStatusLike ? LikeStatusEnum.None : userStatusLike,
        newestLikes: newestLikesArray,
      },
    };
  }

  postsModel(
    posts: PostDocumentType[],
    likes: any,
    newestLikesArray: NewestLikesModel[],
  ): PostOutputModel[] {
    return posts.map((post: PostDocumentType) => {
      const foundLike = likes.find(
        (like: any) => like.parentId === post._id.toString(),
      );
      const userStatus: LikeStatusEnum = foundLike
        ? foundLike.status
        : LikeStatusEnum.None;

      return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.extendedLikesInfo.likesCount,
          dislikesCount: post.extendedLikesInfo.dislikesCount,
          myStatus: userStatus,
          newestLikes: newestLikesArray[post._id.toString()]
            ? newestLikesArray[post._id.toString()]
            : [],
        },
      };
    });
  }
}
