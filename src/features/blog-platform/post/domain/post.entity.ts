import {
  PostInputModel,
  PostUpdateModel,
} from '../api/models/input/post-input.model';
import { LikeStatusEnum } from '../../like/domain/type';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blog/domain/blog.entity';
import { Comment } from '../../comment/domain/comment.entity';
import { Like, PostLike } from '../../like/domain/like.entity';

export enum PostPropertyEnum {
  'id' = 'id',
  'title' = 'title',
  'shortDescription' = 'shortDescription',
  'content' = 'content',
  'createdAt' = 'createdAt',
  'isActive' = 'isActive',
  'blog' = 'blog',
  'blogId' = 'blogId',
  'likesCount' = 'likesCount',
  'dislikesCount' = 'dislikesCount',
  'comments' = 'comments',
  'likes' = 'likes',
  'currentUserStatusLike' = 'currentUserStatusLike',
}

export const selectPostProperty = [
  `p.${PostPropertyEnum.id}`,
  `p.${PostPropertyEnum.title}`,
  `p.${PostPropertyEnum.shortDescription}`,
  `p.${PostPropertyEnum.content}`,
  `p.${PostPropertyEnum.createdAt}`,
  `p.${PostPropertyEnum.likesCount}`,
  `p.${PostPropertyEnum.dislikesCount}`,
  `p.${PostPropertyEnum.blogId}`,
];

@Entity()
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
  @Column({ default: 0 })
  likesCount: number;
  @Column({ default: 0 })
  dislikesCount: number;
  @ManyToOne(() => Blog, (blog: Blog) => blog.posts)
  @JoinColumn()
  blog: Blog;
  @Column()
  blogId: number;
  @OneToMany(() => Comment, (comment: Comment) => comment.post)
  comments: Comment[];
  @OneToMany(() => PostLike, (like: PostLike) => like.parent)
  likes: PostLike[];
  currentUserLike?: Like;

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
    post.likesCount = 0;
    post.dislikesCount = 0;
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

export type PostLikeJoinType = Post & {
  status: LikeStatusEnum;
  blogName: string;
};

export type PostBlogJoinType = Post & {
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
