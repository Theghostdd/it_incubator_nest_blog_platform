import { PostDocumentType } from '../../../domain/post.entity';
import { LikeStatusEnum } from '../../../../like/domain/type';
import { LikeDocumentType } from '../../../../like/domain/like.entity';

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
    userLike: LikeDocumentType | null,
    newestLikesArray: NewestLikesModel[] | [],
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
        myStatus: !userLike ? LikeStatusEnum.None : userLike.status,
        newestLikes: newestLikesArray,
      },
    };
  }

  postsModel(
    posts: PostDocumentType[],
    likes: LikeDocumentType[] | [],
    newestLikesArray: MapPostsType,
  ): PostOutputModel[] {
    return posts.map((post: PostDocumentType) => {
      const foundLike: LikeDocumentType = likes.find(
        (like: LikeDocumentType) => like.parentId === post._id.toString(),
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

export type MapPostsType = {
  [key: string]: NewestLikesModel[];
};