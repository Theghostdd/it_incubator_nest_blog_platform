import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../domain/post.entity';
import { UserPropertyEnum } from '../../../users/user/domain/user.entity';
import { BlogPropertyEnum } from '../../blog/domain/types';
import { PostPropertyEnum } from '../domain/types';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}
  async save(post: Post): Promise<number> {
    const postEntity = await this.postRepository.save(post);
    return postEntity.id;
  }

  async getPostById(id: number): Promise<Post | null> {
    return await this.postRepository
      .createQueryBuilder('p')
      .select([
        `p.${PostPropertyEnum.id}`,
        `p.${PostPropertyEnum.content}`,
        `p.${PostPropertyEnum.title}`,
        `p.${PostPropertyEnum.shortDescription}`,
        `p.${PostPropertyEnum.createdAt}`,
        `p.${PostPropertyEnum.blogId}`,
      ])
      .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
      .addSelect(`b.${BlogPropertyEnum.name}`)
      .where(`p.${PostPropertyEnum.id} = :id`, { id: id })
      .andWhere(`p.${UserPropertyEnum.isActive} = :isActive`, {
        isActive: true,
      })
      .getOne();
  }
}
