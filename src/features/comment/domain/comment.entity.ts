import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Comment {
  @Prop({ type: String, required: true, min: 1, max: 1000 })
  content: string;
  @Prop({
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
  })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  @Prop({
    type: {
      postId: { type: String, required: true },
    },
  })
  postInfo: {
    postId: string;
  };
  @Prop({ type: { blogId: { type: String, required: true } } })
  blogInfo: {
    blogId: string;
  };
  @Prop({
    type: {
      likesCount: { type: Number, required: true, default: 0 },
      dislikesCount: { type: Number, required: true, default: 0 },
    },
  })
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
  @Prop({ type: String, required: true, default: new Date().toISOString() })
  createdAt: string;
}

export const CommentSchema: MongooseSchema<Comment> =
  SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocumentType = HydratedDocument<Comment>;

type CommentModelStaticType = {};

export type CommentModelType = Model<CommentDocumentType> &
  CommentModelStaticType;
