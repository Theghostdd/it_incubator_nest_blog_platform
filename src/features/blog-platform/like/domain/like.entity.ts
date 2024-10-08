import { EntityTypeEnum, LikeStatusEnum } from './type';
import { LikeInputModel } from '../api/models/input/like-input-model';
import { Injectable } from '@nestjs/common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';
import { Post } from '../../post/domain/post.entity';
import { Comment } from '../../comment/domain/comment.entity';

export enum LikePropertyEnum {
  'id' = 'id',
  'entityType' = 'entityType',
  'status' = 'status',
  'createdAt' = 'createdAt',
  'lastUpdateAt' = 'lastUpdateAt',
  'user' = 'user',
  'userId' = 'userId',
  'parent' = 'parent',
  'parentId' = 'parentId',
}

export const selectLikeProperty = [
  `l.${LikePropertyEnum.id}`,
  `l.${LikePropertyEnum.status}`,
  `l.${LikePropertyEnum.createdAt}`,
  `l.${LikePropertyEnum.lastUpdateAt}`,
  `l.${LikePropertyEnum.userId}`,
  `l.${LikePropertyEnum.parentId}`,
];

export class Like {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ enum: LikeStatusEnum })
  status: LikeStatusEnum;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastUpdateAt: Date;
  @Column()
  userId: number;
  @Column()
  parentId: number;

  static createLike(
    likeInputModel: LikeInputModel,
    parent: Post | Comment,
    user: User,
    createdAt: Date,
    lastUpdateAt: Date,
  ): Like {
    const { likeStatus } = likeInputModel;
    const like = new this();
    like.userId = user.id;
    like.parentId = parent.id;
    like.status = likeStatus;
    like.createdAt = createdAt;
    like.lastUpdateAt = lastUpdateAt;
    return like;
  }
}

@Entity()
export class PostLike extends Like {
  @ManyToOne(() => Post, (post: Post) => post.likes)
  @JoinColumn()
  public parent: Post;
  @ManyToOne(() => User, (user: User) => user.userPostLike)
  @JoinColumn()
  user: User;
}

@Entity()
export class CommentLike extends Like {
  @ManyToOne(() => Comment, (comment: Comment) => comment.likes)
  @JoinColumn()
  public parent: Comment;
  @ManyToOne(() => User, (user: User) => user.userCommentLike)
  @JoinColumn()
  user: User;
}

export type LikeType = Like & { id: number };

@Injectable()
export class LikeFactory {
  constructor() {}
  create(
    likeInputModel: LikeInputModel,
    parentId: number,
    userId: number,
    entityType: EntityTypeEnum,
  ): Like {
    // @ts-ignore
    const like = new Like();
    like.userId = userId;
    like.parentId = parentId;
    like.status = likeInputModel.likeStatus;
    like.createdAt = new Date();
    like.lastUpdateAt = new Date();
    return like;
  }
}
