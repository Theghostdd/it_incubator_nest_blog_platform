import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Post,
  PostPropertyEnum,
  selectPostProperty,
} from '../domain/post.entity';
import { tablesName } from '../../../../core/utils/tables/tables';
import { BlogPropertyEnum } from '../../blog/domain/blog.entity';
import { UserPropertyEnum } from '../../../users/user/domain/user.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}
  async save(post: Post): Promise<number> {
    const postEntity = await this.postRepository.save(post);
    return postEntity.id;
  }

  async getPostById(id: number): Promise<Post | null> {
    return await this.postRepository
      .createQueryBuilder('p')
      .select(selectPostProperty)
      .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
      .addSelect(`b.${BlogPropertyEnum.name}`)
      .where(`p.${PostPropertyEnum.id} = :id`, { id: id })
      .andWhere(`p.${UserPropertyEnum.isActive} = :isActive`, {
        isActive: true,
      })
      .getOne();
  }

  async updatePostLikeById(
    id: number,
    likeCount: number,
    dislikeCount: number,
  ): Promise<void> {
    const query = `
        UPDATE ${tablesName.POSTS}
        SET "likesCount" = "likesCount" + $1, 
            "dislikesCount" = "dislikesCount" + $2
        WHERE "id" = $3 AND "isActive" = ${true}
    `;
    await this.dataSource.query(query, [likeCount, dislikeCount, id]);
  }
}
