import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocumentType,
  CommentModelType,
} from '../domain/comment.entity';
import {
  CommentMapperOutputModel,
  CommentOutputModel,
} from '../api/model/output/comment-output.model';
import { SortOrder } from 'mongoose';
import { BaseSorting } from '../../../base/sorting/base-sorting';
import { BasePagination } from '../../../base/pagination/base-pagination';

@Injectable()
export class CommentQueryRepositories {
  constructor(
    private readonly commentMapperOutputModel: CommentMapperOutputModel,
    private readonly baseSorting: BaseSorting,
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
  ) {}

  async getCommentById(
    id: string,
    userId?: string,
  ): Promise<CommentOutputModel> {
    const like = null;
    //if (userId) like = await this.likeModel.findOne({ userId: userId, parentId: id });
    const comment: CommentDocumentType | null = await this.commentModel.findOne(
      {
        _id: id,
      },
    );
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentMapperOutputModel.commentModel(comment, like);
  }

  async getCommentsByPostId(
    query: BaseSorting,
    postId: string,
    userId?: string,
  ): Promise<BasePagination<CommentOutputModel[] | []>> {
    const { sortBy, sortDirection, pageSize, pageNumber } =
      this.baseSorting.createBaseQuery(query);

    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortDirection as SortOrder,
    };

    const filter = {
      'postInfo.postId': postId || { $ne: '' },
    };

    const getTotalDocument: number =
      await this.commentModel.countDocuments(filter);
    const totalCount: number = +getTotalDocument;
    const pagesCount: number = Math.ceil(totalCount / pageSize);
    const skip: number = (+pageNumber - 1) * pageSize;

    const comments: CommentDocumentType[] | [] = await this.commentModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const likes = [];
    // if (userId) {
    //   const commentsIds: string[] = comments.map((id) => id._id.toString());
    //   likes = await this.likeModel.find({
    //     userId: userId,
    //     parentId: { $in: commentsIds },
    //   });
    // }

    return {
      pagesCount: +pagesCount,
      page: +pageNumber!,
      pageSize: +pageSize!,
      totalCount: +totalCount,
      items:
        comments.length > 0
          ? this.commentMapperOutputModel.commentsModel(comments, likes)
          : [],
    };
  }
}
