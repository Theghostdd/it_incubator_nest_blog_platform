import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PostMapperOutputModel,
  PostOutputModel,
} from '../api/models/output/post-output.model';
import { BaseSorting } from '../../../base/sorting/base-sorting';
import { Post, PostDocumentType, PostModelType } from '../domain/post.entity';
import { BasePagination } from '../../../base/pagination/base-pagination';
import { SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../blog/domain/blog.entity';
import {
  Like,
  LikeDocumentType,
  LikeModelType,
} from '../../like/domain/like.entity';
import { LikeStatusEnum } from '../../like/domain/type';
import { NewestLikesModel } from '../../like/domain/models';
import {
  User,
  UserDocumentType,
  UserModelType,
} from '../../user/domain/user.entity';

@Injectable()
export class PostQueryRepository {
  constructor(
    private readonly postMapperOutputModel: PostMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
    @InjectModel(User.name) private readonly userModel: UserModelType,
    @InjectModel(Post.name) private readonly postModel: PostModelType,
    @InjectModel(Like.name) private readonly likeModel: LikeModelType,
  ) {}

  async getPostById(id: string, userId?: string): Promise<PostOutputModel> {
    const post: PostDocumentType | null = await this.postModel.findOne({
      _id: id,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let userLike: LikeDocumentType | null = null;
    if (userId) {
      userLike = await this.likeModel.findOne({ userId: userId, parentId: id });
    }

    const lastLikes: LikeDocumentType[] | [] = await this.likeModel
      .find({ parentId: id, status: LikeStatusEnum.Like })
      .sort({ lastUpdateAt: -1 })
      .limit(3);

    let newestLikesArray: NewestLikesModel[] | [] = [];
    if (lastLikes.length > 0) {
      const userIds: string[] = lastLikes.map(
        (like: LikeDocumentType) => like.userId,
      );
      const users = await this.userModel.find({ _id: { $in: userIds } });

      newestLikesArray = lastLikes.map((like: LikeDocumentType) => {
        const user: UserDocumentType = users.find(
          (u) => u._id.toString() === like.userId,
        )!;
        return {
          addedAt: like.lastUpdateAt,
          userId: user._id.toString(),
          login: user.login,
        };
      });
    }

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
    if (blogId) {
      const blog = await this.blogModel.findOne({ _id: blogId });
      if (!blog) throw new NotFoundException('Blog not found');
    }
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
    //     const user.integration-spec.ts = await this.userModel.findById(like.userId).exec();
    //     return {
    //       addedAt: like.lastUpdateAt,
    //       userId: like.userId,
    //       login: user.integration-spec.ts!.login,
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
