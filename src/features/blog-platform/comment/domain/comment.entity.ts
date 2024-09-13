import { CommentInputModel } from '../api/model/input/comment-input.model';
import { Injectable } from '@nestjs/common';
import { LikeStatusEnum } from '../../like/domain/type';

export class Comment {
  content: string;
  userId: number;
  userLogin: string;
  postId: number;
  blogId: number;
  likesCount: number;
  dislikesCount: number;
  createdAt: Date;
}

export type CommentType = Comment & { id: number };

@Injectable()
export class CommentFactory {
  constructor() {}
  create(
    commentInputModel: CommentInputModel,
    userId: number,
    userLogin: string,
    postId: number,
    blogId: number,
  ): Comment {
    const comment = new Comment();
    const { content } = commentInputModel;
    comment.content = content;
    comment.userId = userId;
    comment.userLogin = userLogin;
    comment.blogId = blogId;
    comment.postId = postId;
    comment.likesCount = 0;
    comment.dislikesCount = 0;
    comment.createdAt = new Date();
    return comment;
  }
}

export type CommentLikeJoinType = CommentType & {
  status: LikeStatusEnum;
};
