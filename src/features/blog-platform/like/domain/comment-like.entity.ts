import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Comment } from '../../comment/domain/comment.entity';
import { User } from '../../../users/user/domain/user.entity';
import { Like } from './like.entity';

@Entity()
export class CommentLike extends Like<Comment> {
  @ManyToOne(() => Comment, (comment: Comment) => comment.likes)
  @JoinColumn()
  parent: Comment;
  @ManyToOne(() => User, (user: User) => user.userCommentLike)
  @JoinColumn()
  user: User;
}
