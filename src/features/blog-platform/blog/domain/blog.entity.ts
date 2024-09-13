import { Injectable } from '@nestjs/common';
import { BlogInputModel } from '../api/models/input/blog-input.model';

export class Blog {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}

export type BlogType = Blog & { id: number };

@Injectable()
export class BlogFactory {
  constructor() {}
  create(blogInputModel: BlogInputModel): Blog {
    const blog = new Blog();
    const { name, description, websiteUrl } = blogInputModel;
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    return blog;
  }
}
