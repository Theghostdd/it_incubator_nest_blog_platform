import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PostMapperOutputModel,
  PostOutputModel,
} from '../api/models/output/post-output.model';
import {
  Post,
  PostPropertyEnum,
  selectPostProperty,
} from '../domain/post.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { tablesName } from '../../../../core/utils/tables/tables';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { Blog, BlogPropertyEnum } from '../../blog/domain/blog.entity';
import { LikePropertyEnum, PostLike } from '../../like/domain/like.entity';
import { UserPropertyEnum } from '../../../users/user/domain/user.entity';

@Injectable()
export class PostQueryRepository {
  constructor(
    private readonly postMapperOutputModel: PostMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
  ) {}

  async getPostById(id: number, userId?: number): Promise<PostOutputModel> {
    const post: Post | null = await this.postRepository
      .createQueryBuilder('p')
      .select(selectPostProperty)
      .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
      .addSelect(`b.${BlogPropertyEnum.name}`)
      .leftJoinAndMapOne(
        `p.${PostPropertyEnum.currentUserStatusLike}`,
        `p.${PostPropertyEnum.likes}`,
        'cul',
        `cul.${LikePropertyEnum.userId} = :userId OR cul.${LikePropertyEnum.userId} IS NULL`,
        { userId: userId || null },
      )
      .where(`p.${PostPropertyEnum.id} = :id`, { id: id })
      .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
        isActive: true,
      })
      .getOne();

    // const myUserId = 1;
    //
    // const post2: any = await this.postRepository
    //   .createQueryBuilder('p')
    //   .select(selectPostProperty)
    //   .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
    //   .addSelect(`b.${BlogPropertyEnum.name}`)
    //   // .leftJoinAndMapOne(
    //   //   'p.currentUserLike',
    //   //   `p.${PostPropertyEnum.likes}`,
    //   //   'cul',
    //   //   `cul.${LikePropertyEnum.parentId} = :postId AND cul.${LikePropertyEnum.status} = :status AND cul.${LikePropertyEnum.userId} = :userId`,
    //   //   { postId: id, status: 'Like', userId: myUserId },
    //   // )
    //   // .leftJoinAndMapMany(
    //   //   'p.currentUserLike',
    //   //   `p.${PostPropertyEnum.likes}`,
    //   //   'cul',
    //   //   `cul.${LikePropertyEnum.parentId} = :postId AND cul.${LikePropertyEnum.status} = :status AND cul.${LikePropertyEnum.userId} = :userId`,
    //   //   { postId: id, status: 'Like', userId: myUserId },
    //   // )
    //   .leftJoinAndMapMany(
    //     'p.lastLikes',
    //     `p.${PostPropertyEnum.likes}`,
    //     'l',
    //     `l.${LikePropertyEnum.parentId} = :postId AND l.${LikePropertyEnum.status} = :status`,
    //     { postId: id, status: 'Like' },
    //   )
    //   .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
    //   .addSelect(`u.${UserPropertyEnum.login}`)
    //   .where(`p.${PostPropertyEnum.id} = :id`, { id: id })
    //   .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
    //     isActive: true,
    //   })
    //   .orderBy(`l.${LikePropertyEnum.lastUpdateAt}`, 'DESC')
    //   .limit(3)
    //   .getOne();

    if (!post) throw new NotFoundException('Post not found');
    const lastLikes: PostLike[] | [] = await this.postLikeRepository
      .createQueryBuilder('l')
      .select([
        `l.${LikePropertyEnum.lastUpdateAt}`,
        `l.${LikePropertyEnum.userId}`,
      ])
      .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
      .addSelect(`u.${UserPropertyEnum.login}`)
      .where(`l.${LikePropertyEnum.parentId} = :postId`, { postId: id })
      .andWhere(`l.${LikePropertyEnum.status} = :status`, { status: 'Like' })
      .orderBy(`l.${LikePropertyEnum.lastUpdateAt}`, 'DESC')
      .limit(3)
      .getMany();

    return this.postMapperOutputModel.postModel(
      post,
      lastLikes.length < 1 ? [] : lastLikes,
    );
  }

  async getPosts(
    query: BaseSorting,
    blogId?: number,
    userId?: number,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    if (blogId) {
      const blogQuery = `
          SELECT "id"
          FROM ${tablesName.BLOGS}
          WHERE "id" = $1 AND "isActive" = true
      `;
      const blog: Blog[] | [] = await this.dataSource.query(blogQuery, [
        blogId,
      ]);
      if (blog.length <= 0) throw new NotFoundException('Blog not found');
    }

    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const skip: number = (+pageNumber - 1) * pageSize;
    const posts: [Post[] | [], number] = await this.postRepository
      .createQueryBuilder('p')
      .select(selectPostProperty)
      .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
      .addSelect(`b.${BlogPropertyEnum.name}`)
      .leftJoinAndMapOne(
        `p.${PostPropertyEnum.currentUserStatusLike}`,
        `p.${PostPropertyEnum.likes}`,
        'cul',
        `cul.${LikePropertyEnum.userId} = :userId OR cul.${LikePropertyEnum.userId} IS NULL`,
        { userId: userId || null },
      )
      .where(
        new Brackets((qb) => {
          qb.where(`p.${PostPropertyEnum.blogId} = :blogId`, {
            blogId: blogId || null,
          }).orWhere(`p.${PostPropertyEnum.blogId} IS NOT NULL`);
        }),
      )
      .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
        isActive: true,
      })
      .orderBy(`p."${sortBy}"`, sortDirection as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset(skip)
      .getManyAndCount();

    const totalCount: number = posts[1];
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    let lastLikes: PostLike[] | [] = [];
    if (posts[0].length > 0) {
      const postIds: number[] = posts[0].map((post: Post) => post.id);

      lastLikes = await this.postLikeRepository
        .createQueryBuilder('l')
        .select([
          `l.${LikePropertyEnum.lastUpdateAt}`,
          `l.${LikePropertyEnum.userId}`,
          `l.${LikePropertyEnum.parentId}`,
        ])
        .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
        .addSelect(`u.${UserPropertyEnum.login}`)
        .where(`l.${LikePropertyEnum.parentId} IN (:...postIds)`, {
          postIds: postIds,
        })
        .andWhere(`l.${LikePropertyEnum.status} = :status`, { status: 'Like' })
        .orderBy(`l.${LikePropertyEnum.lastUpdateAt}`, 'DESC')
        .limit(3)
        .getMany();

      //   const lastLikesQuery = `
      //   SELECT "l"."lastUpdateAt", "l"."parentId" as "postId", "u"."login" as "userLogin", "u"."id" as "userId"
      //   FROM "${tablesName.LIKES}" as "l"
      //   JOIN "${tablesName.USERS}" as "u" ON "u"."id" = "l"."userId" AND "u"."isActive" = ${true}
      //   WHERE "l"."id" IN (
      //     SELECT "l2"."id"
      //     FROM ${tablesName.LIKES} as "l2"
      //     WHERE "l2"."parentId" = "l"."parentId"
      //     AND "l2"."entityType" = $1
      //     AND "l2"."isActive" = ${true}
      //     AND "l2"."status" = 'Like'
      //     ORDER BY "l2"."lastUpdateAt" DESC
      //     LIMIT 3
      //   )
      //   AND "l"."parentId" IN (${postIds})
      //   ORDER BY "l"."lastUpdateAt" DESC;
      // `;

      // lastLikes = await this.dataSource.query(lastLikesQuery, [
      //   EntityTypeEnum.Post,
      // ]);
    }

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: this.postMapperOutputModel.postsModel(
        posts[0].length <= 0 ? [] : posts[0],
        lastLikes.length <= 0 ? [] : lastLikes,
      ),
    };
  }
}
