import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog, BlogType } from '../domain/blog.entity';
import { tablesName } from '../../../../core/utils/tables/tables';
import { BlogUpdateModel } from '../api/models/input/blog-input.model';

@Injectable()
export class BlogRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async save(blog: Blog): Promise<number> {
    const query = `
      INSERT INTO ${tablesName.BLOGS}
        ("name", "description", "websiteUrl", "isMembership", "createdAt", "isActive")
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING "id"
    `;
    const result: { id: number }[] = await this.dataSource.query(query, [
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.isMembership,
      blog.createdAt,
      true,
    ]);
    return result[0].id;
  }

  async delete(blogId: number): Promise<void> {
    const query = `
      UPDATE "${tablesName.BLOGS}"
        SET "isActive" = ${false}
        WHERE "id" = $1 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [blogId]);
  }

  async getBlogById(id: number): Promise<BlogType | null> {
    const query = `
      SELECT "id", "name", "description", "websiteUrl", "isMembership", "createdAt"
      FROM "${tablesName.BLOGS}"
      WHERE "id" = $1 AND "isActive" = ${true}
    `;
    const result = await this.dataSource.query(query, [id]);
    return result.length > 0 ? result[0] : null;
  }

  async updateBlogById(
    blogId: number,
    blogUpdateModel: BlogUpdateModel,
  ): Promise<void> {
    const query = `
      UPDATE "${tablesName.BLOGS}"
      SET "name" = $1, "description" = $2, "websiteUrl" = $3
      WHERE "id" = $4 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [
      blogUpdateModel.name,
      blogUpdateModel.description,
      blogUpdateModel.websiteUrl,
      blogId,
    ]);
  }
}
