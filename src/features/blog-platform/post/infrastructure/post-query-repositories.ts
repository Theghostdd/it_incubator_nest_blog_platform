import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PostMapperOutputModel,
  PostOutputModel,
} from '../api/models/output/post-output.model';
import { Post } from '../domain/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { PostLike } from '../../like/domain/post-like.entity';
import { BlogPropertyEnum } from '../../blog/domain/types';
import {
  PostPropertyEnum,
  PostRawDataType,
  selectPostProperty,
} from '../domain/types';
import { LikePropertyEnum, LikeStatusEnum } from '../../like/domain/type';
import { Blog } from '../../blog/domain/blog.entity';
import { CommentPropertyEnum } from '../../comment/domain/types';
import { UserPropertyEnum } from '../../../users/user/domain/types';

@Injectable()
export class PostQueryRepository {
  constructor(
    private readonly postMapperOutputModel: PostMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}

  async getPostById(id: number, userId?: number): Promise<PostOutputModel> {
    const post: PostRawDataType | null = await this.postRepository
      .createQueryBuilder('p')
      .select(selectPostProperty)
      .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
      .addSelect(`b.${BlogPropertyEnum.name} as "${PostPropertyEnum.blogName}"`)
      .leftJoin(
        `p.${PostPropertyEnum.likes}`,
        'cul',
        `cul.${LikePropertyEnum.userId} = :currentUserId AND cul.${LikePropertyEnum.parentId} = :postId`,
        { currentUserId: userId || null, postId: id },
      )
      .addSelect(
        `COALESCE(cul.${LikePropertyEnum.status}, '${LikeStatusEnum.None}') as "${PostPropertyEnum.currentUserStatusLike}"`,
      )
      .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
        return subQuery
          .select(
            `COUNT(l.${LikePropertyEnum.id})`,
            `${PostPropertyEnum.likesCount}`,
          )
          .from(this.postLikeRepository.target, 'l')
          .where(`l.${LikePropertyEnum.status} = :likeStatus`, {
            likeStatus: LikeStatusEnum.Like,
          })
          .andWhere(
            `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
          );
      }, `${PostPropertyEnum.likesCount}`)
      .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
        return subQuery
          .select(
            `COUNT(l.${LikePropertyEnum.id})`,
            `${PostPropertyEnum.dislikesCount}`,
          )
          .from(this.postLikeRepository.target, 'l')
          .where(`l.${LikePropertyEnum.status} = :dislikeStatus`, {
            dislikeStatus: LikeStatusEnum.Dislike,
          })
          .andWhere(
            `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
          );
      }, `${PostPropertyEnum.dislikesCount}`)
      .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
        return subQuery
          .select(
            `jsonb_agg(json_build_object(
                        '${LikePropertyEnum.userId}', l."${LikePropertyEnum.userId}",
                        '${LikePropertyEnum.lastUpdateAt}', l."${LikePropertyEnum.lastUpdateAt}",
                        '${LikePropertyEnum.userLogin}', l.${UserPropertyEnum.login},
                        '${LikePropertyEnum.status}', l.${LikePropertyEnum.status}
                      ))`,
            `${PostPropertyEnum.lastLikes}`,
          )
          .from((subSubQuery) => {
            return subSubQuery
              .select('*')
              .from(this.postLikeRepository.target, 'l')
              .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
              .where(
                `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
              )
              .andWhere(`l.${LikePropertyEnum.status} = :status`, {
                status: LikeStatusEnum.Like,
              })
              .orderBy(`l.${LikePropertyEnum.lastUpdateAt}`, 'DESC')
              .limit(3);
          }, 'l');
      }, `${PostPropertyEnum.lastLikes}`)
      .where(`p.${PostPropertyEnum.id} = :id`, { id: id })
      .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
        isActive: true,
      })
      .groupBy(
        `p.${CommentPropertyEnum.id}, cul.${LikePropertyEnum.id}, b.${BlogPropertyEnum.id}`,
      )
      .getRawOne();
    if (!post) throw new NotFoundException('Post not found');
    return this.postMapperOutputModel.postModel(post);
  }

  async getPosts(
    query: BaseSorting,
    blogId?: number,
    userId?: number,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    if (blogId) {
      const blog: Blog | null = await this.blogRepository.findOne({
        where: {
          [BlogPropertyEnum.id]: blogId,
          [BlogPropertyEnum.isActive]: true,
        },
        select: [BlogPropertyEnum.id],
      });
      if (!blog) throw new NotFoundException('Blog not found');
    }

    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const skip: number = (+pageNumber - 1) * pageSize;
    const [posts, count]: [PostRawDataType[] | [], number] = await Promise.all([
      this.postRepository
        .createQueryBuilder('p')
        .select(selectPostProperty)
        .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
        .addSelect(
          `b.${BlogPropertyEnum.name} as "${PostPropertyEnum.blogName}"`,
        )
        .leftJoin(
          `p.${PostPropertyEnum.likes}`,
          'cul',
          `cul.${LikePropertyEnum.userId} = :currentUserId AND cul.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
          { currentUserId: userId || null },
        )
        .addSelect(
          `COALESCE(cul.${LikePropertyEnum.status}, '${LikeStatusEnum.None}') as "${PostPropertyEnum.currentUserStatusLike}"`,
        )
        .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
          return subQuery
            .select(
              `COUNT(l.${LikePropertyEnum.id})`,
              `${PostPropertyEnum.likesCount}`,
            )
            .from(this.postLikeRepository.target, 'l')
            .where(`l.${LikePropertyEnum.status} = :likeStatus`, {
              likeStatus: LikeStatusEnum.Like,
            })
            .andWhere(
              `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
            );
        }, `${PostPropertyEnum.likesCount}`)
        .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
          return subQuery
            .select(
              `COUNT(l.${LikePropertyEnum.id})`,
              `${PostPropertyEnum.dislikesCount}`,
            )
            .from(this.postLikeRepository.target, 'l')
            .where(`l.${LikePropertyEnum.status} = :dislikeStatus`, {
              dislikeStatus: LikeStatusEnum.Dislike,
            })
            .andWhere(
              `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
            );
        }, `${PostPropertyEnum.dislikesCount}`)
        .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
          return subQuery
            .select(
              `jsonb_agg(json_build_object(
                        '${LikePropertyEnum.userId}', l."${LikePropertyEnum.userId}",
                        '${LikePropertyEnum.lastUpdateAt}', l."${LikePropertyEnum.lastUpdateAt}",
                        '${LikePropertyEnum.userLogin}', l.${UserPropertyEnum.login},
                        '${LikePropertyEnum.status}', l.${LikePropertyEnum.status}
                      ))`,
              `${PostPropertyEnum.lastLikes}`,
            )
            .from((subSubQuery) => {
              return subSubQuery
                .select('*')
                .from(this.postLikeRepository.target, 'l')
                .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
                .where(
                  `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
                )
                .andWhere(`l.${LikePropertyEnum.status} = :status`, {
                  status: LikeStatusEnum.Like,
                })
                .orderBy(`l.${LikePropertyEnum.lastUpdateAt}`, 'DESC')
                .limit(3);
            }, 'l');
        }, `${PostPropertyEnum.lastLikes}`)
        .where(
          new Brackets((qb: WhereExpressionBuilder) => {
            if (blogId) {
              qb.where(`p.${PostPropertyEnum.blogId} = :blogId`, { blogId });
            } else {
              qb.where(`p.${PostPropertyEnum.blogId} IS NOT NULL`);
            }
          }),
        )
        .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
          isActive: true,
        })
        .groupBy(
          `p.${CommentPropertyEnum.id}, cul.${LikePropertyEnum.id}, b.${BlogPropertyEnum.id}`,
        )
        .limit(pageSize)
        .orderBy(`"${sortBy}"`, sortDirection as 'ASC' | 'DESC')
        .offset(skip)
        .getRawMany(),
      this.postRepository
        .createQueryBuilder('p')
        .where(
          new Brackets((qb: WhereExpressionBuilder) => {
            if (blogId) {
              qb.where(`p.${PostPropertyEnum.blogId} = :blogId`, { blogId });
            } else {
              qb.where(`p.${PostPropertyEnum.blogId} IS NOT NULL`);
            }
          }),
        )
        .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
          isActive: true,
        })
        .getCount(),
    ]);

    const totalCount: number = count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: this.postMapperOutputModel.postsModel(
        posts.length <= 0 ? [] : posts,
      ),
    };
  }

  async getPostsByBlogger(
    query: BaseSorting,
    blogId: number,
    userId: number,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    const blog: Blog | null = await this.blogRepository.findOne({
      where: {
        [BlogPropertyEnum.id]: blogId,
        [BlogPropertyEnum.isActive]: true,
      },
      select: [BlogPropertyEnum.id, BlogPropertyEnum.ownerId],
    });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.ownerId !== userId) throw new ForbiddenException();

    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const skip: number = (+pageNumber - 1) * pageSize;
    const [posts, count]: [PostRawDataType[] | [], number] = await Promise.all([
      this.postRepository
        .createQueryBuilder('p')
        .select(selectPostProperty)
        .leftJoin(`p.${PostPropertyEnum.blog}`, 'b')
        .addSelect(
          `b.${BlogPropertyEnum.name} as "${PostPropertyEnum.blogName}"`,
        )
        .leftJoin(
          `p.${PostPropertyEnum.likes}`,
          'cul',
          `cul.${LikePropertyEnum.userId} = :currentUserId AND cul.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
          { currentUserId: userId || null },
        )
        .addSelect(
          `COALESCE(cul.${LikePropertyEnum.status}, '${LikeStatusEnum.None}') as "${PostPropertyEnum.currentUserStatusLike}"`,
        )
        .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
          return subQuery
            .select(
              `COUNT(l.${LikePropertyEnum.id})`,
              `${PostPropertyEnum.likesCount}`,
            )
            .from(this.postLikeRepository.target, 'l')
            .where(`l.${LikePropertyEnum.status} = :likeStatus`, {
              likeStatus: LikeStatusEnum.Like,
            })
            .andWhere(
              `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
            );
        }, `${PostPropertyEnum.likesCount}`)
        .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
          return subQuery
            .select(
              `COUNT(l.${LikePropertyEnum.id})`,
              `${PostPropertyEnum.dislikesCount}`,
            )
            .from(this.postLikeRepository.target, 'l')
            .where(`l.${LikePropertyEnum.status} = :dislikeStatus`, {
              dislikeStatus: LikeStatusEnum.Dislike,
            })
            .andWhere(
              `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
            );
        }, `${PostPropertyEnum.dislikesCount}`)
        .addSelect((subQuery: SelectQueryBuilder<PostLike>) => {
          return subQuery
            .select(
              `jsonb_agg(json_build_object(
                        '${LikePropertyEnum.userId}', l."${LikePropertyEnum.userId}",
                        '${LikePropertyEnum.lastUpdateAt}', l."${LikePropertyEnum.lastUpdateAt}",
                        '${LikePropertyEnum.userLogin}', l.${UserPropertyEnum.login},
                        '${LikePropertyEnum.status}', l.${LikePropertyEnum.status}
                      ))`,
              `${PostPropertyEnum.lastLikes}`,
            )
            .from((subSubQuery) => {
              return subSubQuery
                .select('*')
                .from(this.postLikeRepository.target, 'l')
                .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
                .where(
                  `l.${LikePropertyEnum.parentId} = p.${PostPropertyEnum.id}`,
                )
                .andWhere(`l.${LikePropertyEnum.status} = :status`, {
                  status: LikeStatusEnum.Like,
                })
                .orderBy(`l.${LikePropertyEnum.lastUpdateAt}`, 'DESC')
                .limit(3);
            }, 'l');
        }, `${PostPropertyEnum.lastLikes}`)
        .where(
          new Brackets((qb: WhereExpressionBuilder) => {
            if (blogId) {
              qb.where(`p.${PostPropertyEnum.blogId} = :blogId`, { blogId });
            } else {
              qb.where(`p.${PostPropertyEnum.blogId} IS NOT NULL`);
            }
          }),
        )
        .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
          isActive: true,
        })
        .groupBy(
          `p.${CommentPropertyEnum.id}, cul.${LikePropertyEnum.id}, b.${BlogPropertyEnum.id}`,
        )
        .limit(pageSize)
        .orderBy(`"${sortBy}"`, sortDirection as 'ASC' | 'DESC')
        .offset(skip)
        .getRawMany(),
      this.postRepository
        .createQueryBuilder('p')
        .where(
          new Brackets((qb: WhereExpressionBuilder) => {
            if (blogId) {
              qb.where(`p.${PostPropertyEnum.blogId} = :blogId`, { blogId });
            } else {
              qb.where(`p.${PostPropertyEnum.blogId} IS NOT NULL`);
            }
          }),
        )
        .andWhere(`p.${PostPropertyEnum.isActive} = :isActive`, {
          isActive: true,
        })
        .getCount(),
    ]);

    const totalCount: number = count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: this.postMapperOutputModel.postsModel(
        posts.length <= 0 ? [] : posts,
      ),
    };
  }
}
