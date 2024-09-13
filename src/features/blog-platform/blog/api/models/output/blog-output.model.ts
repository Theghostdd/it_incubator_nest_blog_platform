import { BlogType } from '../../../domain/blog.entity';

export class BlogOutputModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export class BlogMapperOutputModel {
  constructor() {}
  blogModel(blog: BlogType): BlogOutputModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }

  blogsModel(blogs: BlogType[]): BlogOutputModel[] {
    return blogs.map((blog: BlogType) => {
      return {
        id: blog.id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership,
      };
    });
  }
}
