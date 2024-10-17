import {
  PostInputModel,
  PostUpdateModel,
} from '../api/models/input/post-input.model';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blog/domain/blog.entity';
import { Comment } from '../../comment/domain/comment.entity';
import { Like } from '../../like/domain/like.entity';
import { PostLike } from '../../like/domain/post-like.entity';

@Entity()
@Index(['id', 'isActive'])
@Index(['title', 'isActive'])
@Index(['createdAt', 'isActive'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @Column({ default: true })
  isActive: boolean;
  @ManyToOne(() => Blog, (blog: Blog) => blog.posts)
  @JoinColumn()
  blog: Blog;
  @Index()
  @Column()
  blogId: number;
  @OneToMany(() => Comment, (comment: Comment) => comment.post)
  comments: Comment[];
  @OneToMany(() => PostLike, (like: PostLike) => like.parent)
  likes: PostLike[];
  currentUserLike?: Like<PostLike>;

  static createPost(
    postInputModel: PostInputModel,
    createdAt: Date,
    blog: Blog,
  ): Post {
    const post = new this();
    const { title, shortDescription, content } = postInputModel;
    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blog = blog;
    post.blogId = blog.id;
    post.createdAt = createdAt;
    post.isActive = true;
    return post;
  }

  deletePost(): void {
    this.isActive = false;
  }

  updatePost(postUpdateModel: PostUpdateModel): void {
    const { title, shortDescription, content } = postUpdateModel;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
  }
}
