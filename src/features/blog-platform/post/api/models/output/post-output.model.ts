import { LikeStatusEnum } from '../../../../like/domain/type';
import {
  LastPostLikeJoinType,
  LastPostsLikeJoinType,
  PostLikeJoinType,
} from '../../../domain/post.entity';

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
    post: PostLikeJoinType,
    lastLikes: LastPostLikeJoinType[] | [],
  ): PostOutputModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: post.status,
        newestLikes: lastLikes.map((lastLike: LastPostLikeJoinType) => {
          return {
            addedAt: lastLike.lastUpdateAt.toISOString(),
            userId: lastLike.userId.toString(),
            login: lastLike.userLogin,
          };
        }),
      },
    };
  }

  postsModel(
    posts: PostLikeJoinType[] | [],
    lastLikes: LastPostsLikeJoinType[] | [],
  ): PostOutputModel[] {
    return posts.map((post: PostLikeJoinType) => {
      return {
        id: post.id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: post.blogName,
        createdAt: post.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: post.likesCount,
          dislikesCount: post.dislikesCount,
          myStatus: post.status,
          newestLikes: lastLikes
            .filter(
              (lastLike: LastPostsLikeJoinType) => lastLike.postId === post.id,
            )
            .map((lastLike: LastPostsLikeJoinType) => ({
              addedAt: lastLike.lastUpdateAt.toISOString(),
              userId: lastLike.userId.toString(),
              login: lastLike.userLogin,
            })),
        },
      };
    });
  }
}
