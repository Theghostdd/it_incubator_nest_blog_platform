import { PostInputModel } from '../api/models/input/post-input.model';
import { Injectable } from '@nestjs/common';
import { LikeStatusEnum } from '../../like/domain/type';

export class Post {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
}

export type PostType = Post & { id: number };

@Injectable()
export class PostFactory {
  constructor() {}
  create(postInputModel: PostInputModel): Post {
    const post = new Post();
    const { title, shortDescription, content, blogId } = postInputModel;
    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = blogId;
    post.createdAt = new Date();
    post.likesCount = 0;
    post.dislikesCount = 0;
    return post;
  }
}

export type PostLikeJoinType = PostType & {
  status: LikeStatusEnum;
  blogName: string;
};

export type PostBlogJoinType = PostType & {
  blogName: string;
};

export type LastPostLikeJoinType = {
  lastUpdateAt: Date;
  userId: number;
  userLogin: string;
};

export type LastPostsLikeJoinType = {
  lastUpdateAt: Date;
  userId: number;
  userLogin: string;
  postId: number;
};
