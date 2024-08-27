import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { CommentInputModel } from '../api/model/input/comment-input.model';
import { use } from 'passport';

@Schema()
export class Comment {
  @Prop({ type: String, required: true, min: 1, max: 1000 })
  content: string;
  @Prop({
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
    _id: false,
  })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  @Prop({
    type: {
      postId: { type: String, required: true },
    },
    _id: false,
  })
  postInfo: {
    postId: string;
  };
  @Prop({ type: { blogId: { type: String, required: true } }, _id: false })
  blogInfo: {
    blogId: string;
  };
  @Prop({
    type: {
      likesCount: { type: Number, required: true, default: 0 },
      dislikesCount: { type: Number, required: true, default: 0 },
    },
    _id: false,
  })
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
  @Prop({ type: String, required: true, default: new Date().toISOString() })
  createdAt: string;

  static createComment(
    inputCommentModel: CommentInputModel,
    userId: string,
    userLogin: string,
    postId: string,
    blogId: string,
  ) {
    const { content } = inputCommentModel;
    const comment = new this();
    comment.content = content;
    comment.commentatorInfo = {
      userId: userId,
      userLogin: userLogin,
    };
    comment.blogInfo = { blogId: blogId };
    comment.postInfo = { postId: postId };
    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
    return comment;
  }
}

export const CommentSchema: MongooseSchema<Comment> =
  SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocumentType = HydratedDocument<Comment>;

type CommentModelStaticType = {
  createComment: (
    inputCommentModel: CommentInputModel,
    userId: string,
    userLogin: string,
    postId: string,
    blogId: string,
  ) => CommentDocumentType;
};

export type CommentModelType = Model<CommentDocumentType> &
  CommentModelStaticType;
