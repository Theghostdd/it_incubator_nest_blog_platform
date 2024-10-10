import {
  CommentInputModel,
  CommentUpdateModel,
} from '../api/model/input/comment-input.model';
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
import { CommentLike } from '../../like/domain/comment-like.entity';

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

  static createComment(
    commentInputModel: CommentInputModel,
    user: User,
    post: Post,
    createdAt: Date,
  ) {
    const comment = new this();
    const { content } = commentInputModel;
    comment.content = content;
    comment.user = user;
    comment.userId = user.id;
    comment.post = post;
    comment.postId = post.id;
    comment.createdAt = createdAt;
    comment.isActive = true;
    return comment;
  }

  updateComment(commentUpdateModel: CommentUpdateModel): void {
    const { content } = commentUpdateModel;
    this.content = content;
  }

  deleteComment(): void {
    this.isActive = false;
  }
}
