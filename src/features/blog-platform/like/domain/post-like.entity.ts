import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Post } from '../../post/domain/post.entity';
import { User } from '../../../users/user/domain/user.entity';
import { Like } from './like.entity';

@Entity()
export class PostLike extends Like<Post> {
  @ManyToOne(() => Post, (post: Post) => post.likes)
  @JoinColumn()
  parent: Post;
  @ManyToOne(() => User, (user: User) => user.userPostLike)
  @JoinColumn()
  user: User;
}
