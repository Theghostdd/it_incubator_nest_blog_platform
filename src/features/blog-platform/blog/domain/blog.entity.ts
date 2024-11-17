import {
  BlogInputModel,
  BlogUpdateModel,
} from '../api/models/input/blog-input.model';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../post/domain/post.entity';
import { User } from '../../../users/user/domain/user.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;
  @Index()
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Index()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @Column({ default: false })
  isMembership: boolean;
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user: User) => user.blog)
  @JoinColumn()
  owner: User;
  @Column({ nullable: true, default: null })
  ownerId: number;

  @OneToMany(() => Post, (post: Post) => post.blog)
  posts: Post[];

  static createBlog(blogInputModel: BlogInputModel, userId?: number): Blog {
    const blog = new this();
    const { name, description, websiteUrl } = blogInputModel;
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    blog.isActive = true;
    if (userId) blog.ownerId = userId;
    return blog;
  }

  deleteBlog(): void {
    this.isActive = false;
  }

  updateBlog(blogUpdateModel: BlogUpdateModel): void {
    const { name, description, websiteUrl } = blogUpdateModel;
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }
}
