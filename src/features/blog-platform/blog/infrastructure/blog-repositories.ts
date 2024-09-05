import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocumentType, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
  ) {}
  async save(blog: BlogDocumentType): Promise<void> {
    await blog.save();
  }

  async delete(blog: BlogDocumentType): Promise<void> {
    await blog.deleteOne();
  }

  async getBlogById(id: string): Promise<BlogDocumentType | null> {
    return this.blogModel.findOne({ _id: id });
  }
}
