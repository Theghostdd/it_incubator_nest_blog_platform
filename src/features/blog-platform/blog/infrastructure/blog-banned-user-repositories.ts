import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogBannedUserEntity } from '../domain/blog-banned-user.entity';

@Injectable()
export class BlogBannedUserRepositories {
  constructor(
    @InjectRepository(BlogBannedUserEntity)
    private readonly blogBannedUserRepository: Repository<BlogBannedUserEntity>,
  ) {}
  async save(bannedUser: BlogBannedUserEntity): Promise<number> {
    const bannedUserEntity =
      await this.blogBannedUserRepository.save(bannedUser);
    return bannedUserEntity.id;
  }
}
