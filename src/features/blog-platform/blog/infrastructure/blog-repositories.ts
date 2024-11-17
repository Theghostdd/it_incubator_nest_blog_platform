import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity';
import { BlogPropertyEnum } from '../domain/types';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}
  async save(blog: Blog): Promise<number> {
    const blogEntity = await this.blogRepository.save(blog);
    return blogEntity.id;
  }
  async getBlogById(id: number): Promise<Blog | null> {
    return this.blogRepository.findOne({
      where: {
        [BlogPropertyEnum.id]: id,
        [BlogPropertyEnum.isActive]: true,
      },
      select: [
        BlogPropertyEnum.id,
        BlogPropertyEnum.name,
        BlogPropertyEnum.description,
        BlogPropertyEnum.websiteUrl,
        BlogPropertyEnum.createdAt,
        BlogPropertyEnum.isMembership,
        BlogPropertyEnum.ownerId,
      ],
    });
  }
}
