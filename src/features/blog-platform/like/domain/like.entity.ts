import { LikeStatusEnum } from './type';
import { LikeInputModel } from '../api/models/input/like-input-model';
import { Column, Index, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../users/user/domain/user.entity';
import { Post } from '../../post/domain/post.entity';
import { Comment } from '../../comment/domain/comment.entity';

@Index(['createdAt', 'status'])
@Index(['lastUpdateAt', 'status'])
export class Like<P> {
  @Index()
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
  user: User;
  @Index()
  @Column()
  userId: number;
  parent: P;
  @Index()
  @Column()
  parentId: number;

  static createLike<P extends Post | Comment>(
    likeInputModel: LikeInputModel,
    parent: P,
    user: User,
    createdAt: Date,
    lastUpdateAt: Date,
  ): Like<P> {
    const { likeStatus } = likeInputModel;
    const like = new this() as Like<P>;
    like.user = user;
    like.userId = user.id;
    like.parent = parent;
    like.parentId = parent.id;
    like.status = likeStatus;
    like.createdAt = createdAt;
    like.lastUpdateAt = lastUpdateAt;
    return like;
  }

  updateLikeStatus(likeInputModel: LikeInputModel, updateAt: Date): void {
    const { likeStatus } = likeInputModel;
    this.status = likeStatus;
    this.lastUpdateAt = updateAt;
  }
}
