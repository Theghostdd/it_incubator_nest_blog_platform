import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { BlogBannedUserPropertyEnum } from '../domain/types';
import { UserPropertyEnum } from '../../../users/user/domain/types';
import { BlogBannedUserEntity } from '../domain/blog-banned-user.entity';
import {
  BlogBloggerBannedUserOutputMapper,
  BlogBloggerBannedUserOutputModel,
} from '../api/models/output/blog-blogger-banned-user-output.model';
import { BlogBannedUserSortingQuery } from '../api/models/input/blog-user-ban-input.model';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogBannedUserQueryRepositories {
  constructor(
    private readonly blogBloggerBannedUserOutputMapper: BlogBloggerBannedUserOutputMapper,
    private readonly blogBannedUserSortingQuery: BlogBannedUserSortingQuery,
    @InjectRepository(BlogBannedUserEntity)
    private readonly blogBannedUserRepository: Repository<BlogBannedUserEntity>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async getBannedUsersForSpecialBlog(
    blogId: number,
    bloggerId: number,
    query: BlogBannedUserSortingQuery,
  ): Promise<BasePagination<BlogBloggerBannedUserOutputModel[] | []>> {
    const { sortBy, sortDirection, searchLoginTerm, pageSize, pageNumber } =
      this.blogBannedUserSortingQuery.createBlogBannedUserQuery(query);
    const skip: number = (+pageNumber - 1) * pageSize;

    const blog = await this.blogRepository.findOne({
      select: { id: true, ownerId: true },
      where: { id: blogId },
    });

    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== bloggerId) throw new ForbiddenException();

    const builder = this.blogBannedUserRepository
      .createQueryBuilder('bbu')
      .leftJoinAndSelect(`bbu.${BlogBannedUserPropertyEnum.user}`, 'u')
      .where(`bbu.${BlogBannedUserPropertyEnum.blogId} = :blogId`, { blogId })
      .andWhere(`bbu.${BlogBannedUserPropertyEnum.isBanned} = true`)
      .andWhere(`u.${UserPropertyEnum.login} ILIKE :login`, {
        login: `%${searchLoginTerm || ''}%`,
      })
      .limit(pageSize)
      .offset(skip);

    if (sortBy === 'login') {
      builder.addOrderBy(
        `u.${UserPropertyEnum.login}`,
        sortDirection as 'ASC' | 'DESC',
      );
    } else {
      builder.addOrderBy(`bbu."${sortBy}"`, sortDirection as 'ASC' | 'DESC');
    }

    const [bannedUsers, count]: [BlogBannedUserEntity[], number] =
      await builder.getManyAndCount();

    const totalCount: number = count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items:
        bannedUsers.length > 0
          ? this.blogBloggerBannedUserOutputMapper.mapBannedUsersOutputModel(
              bannedUsers,
            )
          : [],
    };
  }
}
