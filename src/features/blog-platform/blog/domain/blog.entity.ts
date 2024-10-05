import {
  BlogInputModel,
  BlogUpdateModel,
} from '../api/models/input/blog-input.model';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum BlogPropertyEnum {
  'id' = 'id',
  'name' = 'name',
  'description' = 'description',
  'websiteUrl' = 'websiteUrl',
  'createdAt' = 'createdAt',
  'isMembership' = 'isMembership',
  'isActive' = 'isActive',
}

export const selectBlogProperty = [
  `b.${BlogPropertyEnum.id}`,
  `b.${BlogPropertyEnum.name}`,
  `b.${BlogPropertyEnum.description}`,
  `b.${BlogPropertyEnum.websiteUrl}`,
  `b.${BlogPropertyEnum.createdAt}`,
  `b.${BlogPropertyEnum.isMembership}`,
];

@Entity()
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
