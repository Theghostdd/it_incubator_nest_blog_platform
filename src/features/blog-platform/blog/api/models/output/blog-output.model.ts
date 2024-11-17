import { Blog } from '../../../domain/blog.entity';
import { BasePagination } from '../../../../../../base/pagination/base-pagination';
import { ApiProperty } from '@nestjs/swagger';

export class BlogOutputModel {
  @ApiProperty({
    description: 'Unique identifier of the blog',
    example: '123456',
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Name of the blog',
    example: 'Tech Trends',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Description of the blog',
    example: 'A blog about the latest trends in technology.',
    type: String,
  })
  public description: string;

  @ApiProperty({
    description: 'Website URL of the blog',
    example: 'https://www.techtrends.com',
    type: String,
  })
  public websiteUrl: string;

  @ApiProperty({
    description: 'Date and time when the blog was created',
    example: '2024-10-18T12:00:00Z',
    type: String,
  })
  public createdAt: string;

  @ApiProperty({
    description: 'Indicates if membership is required to access the blog',
    example: true,
    type: Boolean,
  })
  public isMembership: boolean;
}

export class BlogOwnerInfoModel {
  @ApiProperty({
    description: 'User`s id',
    example: '1',
    type: String,
  })
  public userId: string;

  @ApiProperty({
    description: 'User`s login',
    example: 'login',
    type: String,
  })
  public userLogin: string;
}

export class BlogWithOwnerInfoOutputModel extends BlogOutputModel {
  blogOwnerInfo: BlogOwnerInfoModel;
}

export class BlogMapperOutputModel {
  constructor() {}
  blogModel(blog: Blog): BlogOutputModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }

  blogsModel(blogs: Blog[]): BlogOutputModel[] {
    return blogs.map((blog: Blog) => {
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

  blogsAdminModel(blogs: Blog[]): BlogWithOwnerInfoOutputModel[] {
    return blogs.map((blog: Blog) => {
      return {
        id: blog.id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.ownerId?.toString() || null,
          userLogin: blog.owner?.login || null,
        },
      };
    });
  }
}

export class BlogOutputModelForSwagger extends BasePagination<BlogOutputModel> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: BlogOutputModel,
  })
  items: BlogOutputModel;
}

export class BlogWithOwnerInfoOutputModelForSwagger extends BasePagination<BlogWithOwnerInfoOutputModel> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: BlogWithOwnerInfoOutputModel,
  })
  items: BlogWithOwnerInfoOutputModel;
}
