import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PostMapperOutputModel,
  PostOutputModel,
} from '../api/models/output/post-output.model';
import { BaseSorting } from '../../../base/sorting/base-sorting';
import { Post, PostDocumentType, PostModelType } from '../domain/post.entity';
import { BasePagination } from '../../../base/pagination/base-pagination';
import { SortOrder } from 'mongoose';
import { LikeStatusEnum } from '../../../base/enum/enum';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostQueryRepository {
  constructor(
    private readonly postMapperOutputModel: PostMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectModel(Post.name) private readonly postModel: PostModelType,
  ) {}

  async getPostById(id: string, userId?: string): Promise<PostOutputModel> {
    const post: PostDocumentType | null = await this.postModel.findOne({
      _id: id,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userLike = null;
    if (userId) {
      // userLike = await this.likeModel.findOne({userId: userId, parentId: id})
    }

    // const lastLikes = await this.likeModel
    //   .find({parentId: id, status: LikeStatusEnum.Like})
    //   .sort({ lastUpdateAt: -1 })
    //   .limit(3)

    const newestLikesArray = [];
    //if (lastLikes.length > 0) {
    //   const userIds: string[] = lastLikes.map((like) => like.userId)
    //   const users = await this.userModel.find({_id: {$in: userIds}})
    //
    //   newestLikesArray = lastLikes.map((like) => {
    //     const user = users.find(u => u._id.toString() === like.userId)!
    //     return {
    //       addedAt: like.lastUpdateAt,
    //       userId: user._id.toString(),
    //       login: user.login
    //     }
    //   })
    // }

    return this.postMapperOutputModel.postModel(
      post,
      userLike,
      newestLikesArray,
    );
  }

  async getPosts(
    query: BaseSorting,
    blogId?: string,
    userId?: string,
  ): Promise<BasePagination<PostOutputModel[] | []>> {
    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortDirection as SortOrder,
    };

    const filter = {
      blogId: blogId ? blogId : { $ne: '' },
    };

    const getTotalDocument: number =
      await this.postModel.countDocuments(filter);
    const totalCount: number = +getTotalDocument;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (+pageNumber - 1) * pageSize;

    const posts: PostDocumentType[] | [] = await this.postModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const likes = [];
    //const postIds: string[] = posts.map((id) => id._id.toString());
    if (userId) {
      //likes = await this.likeModel.find({userId: userId, parentId: {$in: postIds}})
    }

    // const lastLikes = await Promise.all(postIds.map(async (postId) => {
    //   const likes = await this.likeModel
    //     .find({ parentId: postId, status: LikeStatusEnum.Like })
    //     .sort({ lastUpdateAt: -1 })
    //     .limit(3)
    //     .exec();
    //
    //   const likesWithUserDetails = await Promise.all(likes.map(async (like) => {
    //     const user = await this.userModel.findById(like.userId).exec();
    //     return {
    //       addedAt: like.lastUpdateAt,
    //       userId: like.userId,
    //       login: user!.login,
    //     };
    //   }));
    //
    //   return { postId, likes: likesWithUserDetails };
    // }));

    const lastLikesMap = [];
    // const lastLikesMap = lastLikes.reduce((acc: {[key: string]: NewestLikesDto[]}, { postId, likes }) => {
    //   acc[postId] = likes;
    //   return acc;
    // }, {});

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: this.postMapperOutputModel.postsModel(posts, likes, lastLikesMap),
    };
  }
}
