import { LikeStatusEnum } from '../../../../like/domain/type';
import {
  LastPostsLikeJoinType,
  Post,
  PostLikeJoinType,
} from '../../../domain/post.entity';
import { PostLike } from '../../../../like/domain/like.entity';

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
  postModel(post: Post, lastLikes: PostLike[] | []): PostOutputModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blog.name,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: post.currentUserLike?.status
          ? post.currentUserLike.status
          : LikeStatusEnum.None,
        newestLikes: lastLikes.map((lastLike: PostLike) => {
          return {
            addedAt: lastLike.lastUpdateAt.toISOString(),
            userId: lastLike.userId.toString(),
            login: lastLike.user.login,
          };
        }),
      },
    };
  }

  postsModel(
    posts: Post[] | [],
    lastLikes: PostLike[] | [],
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
          myStatus: post.currentUserLike?.status
            ? post.currentUserLike.status
            : LikeStatusEnum.None,
          newestLikes: lastLikes
            .filter((lastLike: PostLike) => lastLike.parentId === post.id)
            .map((lastLike: PostLike) => ({
              addedAt: lastLike.lastUpdateAt.toISOString(),
              userId: lastLike.userId.toString(),
              login: lastLike.user.login,
            })),
        },
      };
    });
  }
}
