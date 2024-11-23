import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CommentMapperOutputModel,
  CommentOutputModel,
} from '../api/model/output/comment-output.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LikePropertyEnum, LikeStatusEnum } from '../../like/domain/type';
import { Comment } from '../domain/comment.entity';
import { BaseSorting } from '../../../../base/sorting/base-sorting';
import { BasePagination } from '../../../../base/pagination/base-pagination';
import { Post } from '../../post/domain/post.entity';
import { CommentLike } from '../../like/domain/comment-like.entity';
import { PostPropertyEnum } from '../../post/domain/types';
import {
  CommentEntityRawDataType,
  CommentPropertyEnum,
  selectCommentProperty,
} from '../domain/types';
import { UserPropertyEnum } from '../../../users/user/domain/types';

@Injectable()
export class CommentQueryRepositories {
  constructor(
    private readonly commentMapperOutputModel: CommentMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async getCommentById(
    id: number,
    userId?: number,
  ): Promise<CommentOutputModel> {
    const comment: CommentEntityRawDataType = await this.commentRepository
      .createQueryBuilder('c')
      .select(selectCommentProperty)
      .leftJoin(`c.${CommentPropertyEnum.user}`, 'u')
      .addSelect(
        `u.${UserPropertyEnum.login} as "${CommentPropertyEnum.userLogin}"`,
      )
      .where(`c.${CommentPropertyEnum.id} = :commentId`, { commentId: id })
      .andWhere(`c.${CommentPropertyEnum.isActive} = :isActive`, {
        isActive: true,
      })
      .andWhere(`u.${UserPropertyEnum.isBan} = :banState`, {
        banState: false,
      })
      .addSelect((subQuery: SelectQueryBuilder<CommentLike>) => {
        return subQuery
          .select(
            `COUNT(l.${LikePropertyEnum.id})`,
            `${CommentPropertyEnum.likesCount}`,
          )
          .from(this.commentLikeRepository.target, 'l')
          .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
          .where(`l.${LikePropertyEnum.status} = :likeStatus`, {
            likeStatus: LikeStatusEnum.Like,
          })
          .andWhere(`u.${UserPropertyEnum.isBan} = :notBannedLikeState`, {
            notBannedLikeState: false,
          })
          .andWhere(
            `l.${LikePropertyEnum.parentId} = c.${CommentPropertyEnum.id}`,
          );
      }, `${CommentPropertyEnum.likesCount}`)
      .addSelect((subQuery: SelectQueryBuilder<CommentLike>) => {
        return subQuery
          .select(
            `COUNT(l.${LikePropertyEnum.id})`,
            `${CommentPropertyEnum.dislikesCount}`,
          )
          .from(this.commentLikeRepository.target, 'l')
          .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
          .where(`l.${LikePropertyEnum.status} = :dislikeStatus`, {
            dislikeStatus: LikeStatusEnum.Dislike,
          })
          .andWhere(`u.${UserPropertyEnum.isBan} = :notBannedDislikeState`, {
            notBannedDislikeState: false,
          })
          .andWhere(`l.${LikePropertyEnum.parentId} = c.id`);
      }, `${CommentPropertyEnum.dislikesCount}`)
      .leftJoin(
        `c.${CommentPropertyEnum.likes}`,
        'cul',
        `cul.${LikePropertyEnum.userId} = :userId AND cul.${LikePropertyEnum.parentId} = :parentId`,
        { userId: userId || null, parentId: id },
      )
      .addSelect(
        `COALESCE(cul.${LikePropertyEnum.status}, '${LikeStatusEnum.None}') as "${CommentPropertyEnum.currentUserLikeStatus}"`,
      )
      .groupBy(
        `c.${CommentPropertyEnum.id}, u.${UserPropertyEnum.id}, cul.${LikePropertyEnum.id}`,
      )
      .getRawOne();
    if (!comment) throw new NotFoundException('Comment not found');
    return this.commentMapperOutputModel.commentModel(comment);
  }

  async getCommentsByPostId(
    query: BaseSorting,
    postId: string,
    userId?: number,
  ): Promise<BasePagination<CommentOutputModel[] | []>> {
    const post = await this.postRepository.findOne({
      where: {
        [PostPropertyEnum.id as string]: postId,
        [PostPropertyEnum.isActive]: true,
      },
      select: [PostPropertyEnum.id],
    });
    if (!post) throw new NotFoundException('Post not found');

    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const skip: number = (+pageNumber - 1) * pageSize;
    const [comments, count]: [CommentEntityRawDataType[] | [], number] =
      await Promise.all([
        this.commentRepository
          .createQueryBuilder('c')
          .select(selectCommentProperty)
          .leftJoin(`c.${CommentPropertyEnum.user}`, 'u')
          .addSelect(
            `u.${UserPropertyEnum.login} as "${CommentPropertyEnum.userLogin}"`,
          )
          .where(`c.${CommentPropertyEnum.postId} = :postId`, {
            postId: postId,
          })
          .andWhere(`c.${CommentPropertyEnum.isActive} = :isActive`, {
            isActive: true,
          })
          .andWhere(`u.${UserPropertyEnum.isBan} = :banState`, {
            banState: false,
          })
          .addSelect((subQuery: SelectQueryBuilder<CommentLike>) => {
            return subQuery
              .select(
                `COUNT(l.${LikePropertyEnum.id})`,
                `${CommentPropertyEnum.likesCount}`,
              )
              .from(this.commentLikeRepository.target, 'l')
              .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
              .where(`l.${LikePropertyEnum.status} = :likeStatus`, {
                likeStatus: LikeStatusEnum.Like,
              })
              .andWhere(`u.${UserPropertyEnum.isBan} = :notBannedLikeState`, {
                notBannedLikeState: false,
              })
              .andWhere(
                `l.${LikePropertyEnum.parentId} = c.${CommentPropertyEnum.id}`,
              );
          }, `${CommentPropertyEnum.likesCount}`)
          .addSelect((subQuery: SelectQueryBuilder<CommentLike>) => {
            return subQuery
              .select(
                `COUNT(l.${LikePropertyEnum.id})`,
                `${CommentPropertyEnum.dislikesCount}`,
              )
              .from(this.commentLikeRepository.target, 'l')
              .leftJoin(`l.${LikePropertyEnum.user}`, 'u')
              .where(`l.${LikePropertyEnum.status} = :dislikeStatus`, {
                dislikeStatus: LikeStatusEnum.Dislike,
              })
              .andWhere(
                `u.${UserPropertyEnum.isBan} = :notBannedDislikeState`,
                {
                  notBannedDislikeState: false,
                },
              )
              .andWhere(`l.${LikePropertyEnum.parentId} = c.id`);
          }, `${CommentPropertyEnum.dislikesCount}`)
          .leftJoin(
            `c.${CommentPropertyEnum.likes}`,
            'cul',
            `cul.${LikePropertyEnum.userId} = :userId AND cul.${LikePropertyEnum.parentId} = c.${CommentPropertyEnum.id}`,
            { userId: userId || null },
          )
          .addSelect(
            `COALESCE(cul.${LikePropertyEnum.status}, '${LikeStatusEnum.None}') as "${CommentPropertyEnum.currentUserLikeStatus}"`,
          )
          .groupBy(
            `c.${CommentPropertyEnum.id}, u.${UserPropertyEnum.id}, cul.${LikePropertyEnum.id}`,
          )
          .orderBy(`c."${sortBy}"`, sortDirection as 'ASC' | 'DESC')
          .limit(pageSize)
          .offset(skip)
          .getRawMany(),
        this.commentRepository
          .createQueryBuilder('c')
          .leftJoin(`c.${CommentPropertyEnum.user}`, 'u')
          .where(`c.${CommentPropertyEnum.postId} = :postId`, {
            postId: postId,
          })
          .andWhere(`u.${UserPropertyEnum.isBan} = :banState`, {
            banState: false,
          })
          .andWhere(`c.${CommentPropertyEnum.isActive} = :isActive`, {
            isActive: true,
          })
          .getCount(),
      ]);

    const totalCount: number = count;
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: +pagesCount,
      page: +pageNumber!,
      pageSize: +pageSize!,
      totalCount: +totalCount,
      items:
        comments.length > 0
          ? this.commentMapperOutputModel.commentsModel(comments)
          : [],
    };
  }
}
