import { CommentInputModel } from '../api/model/input/comment-input.model';
import { Injectable } from '@nestjs/common';
import { LikeStatusEnum } from '../../like/domain/type';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';
import { Post } from '../../post/domain/post.entity';
import { CommentLike, Like } from '../../like/domain/like.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  content: string;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @Column({ default: true })
  isActive: boolean;
  @Column({ default: 0 })
  likesCount: number;
  @Column({ default: 0 })
  dislikesCount: number;

  @ManyToOne(() => User, (user: User) => user.userComments)
  @JoinColumn()
  user: User;
  @Column()
  userId: number;
  @ManyToOne(() => Post, (post: Post) => post.comments)
  @JoinColumn()
  post: Post;
  @Column()
  postId: number;
  @OneToMany(() => CommentLike, (like: CommentLike) => like.parent)
  likes: CommentLike[];
}

export type CommentType = Comment & { id: number };

@Injectable()
export class CommentFactory {
  constructor() {}
  create(
    commentInputModel: CommentInputModel,
    userId: number,
    postId: number,
  ): Comment {
    const comment = new Comment();
    const { content } = commentInputModel;
    comment.content = content;
    comment.userId = userId;
    comment.postId = postId;
    comment.likesCount = 0;
    comment.dislikesCount = 0;
    comment.createdAt = new Date();
    return comment;
  }
}

export type CommentLikeJoinType = CommentType & {
  status: LikeStatusEnum;
  userLogin: string;
};
