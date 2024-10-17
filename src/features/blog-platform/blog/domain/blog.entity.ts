import {
  BlogInputModel,
  BlogUpdateModel,
} from '../api/models/input/blog-input.model';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../post/domain/post.entity';

@Entity()
@Index(['id', 'isActive'])
@Index(['createdAt', 'isActive'])
@Index(['name', 'isActive'])
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @Column({ default: false })
  isMembership: boolean;
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Post, (post: Post) => post.blog)
  posts: Post[];

  static createBlog(blogInputModel: BlogInputModel): Blog {
    const blog = new this();
    const { name, description, websiteUrl } = blogInputModel;
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    blog.isActive = true;
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
