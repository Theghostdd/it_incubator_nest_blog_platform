import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  PostInputModel,
  PostUpdateModel,
} from '../api/models/input/post-input.model';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { LikeStatusEnum } from '../../like/domain/type';

@Schema()
export class Post {
  @Prop({ type: String, required: true, min: 1, max: 30 })
  title: string;
  @Prop({ type: String, required: true, min: 1, max: 100 })
  shortDescription: string;
  @Prop({ type: String, required: true, min: 1, max: 1000 })
  content: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String, required: true, default: new Date().toISOString() })
  createdAt: string;
  @Prop({ type: String, required: true, min: 1, max: 15 })
  blogName: string;
  @Prop({
    type: {
      likesCount: { type: Number, required: true, default: 0 },
      dislikesCount: { type: Number, required: true, default: 0 },
    },
    required: true,
    _id: false,
  })
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
  };

  static createPostInstance(inputModel: PostInputModel, blogName: string) {
    const { title, shortDescription, content, blogId } = inputModel;

    const post = new this();
    post.title = title;
    post.shortDescription = shortDescription;
    post.blogId = blogId;
    post.blogName = blogName;
    post.content = content;
    post.createdAt = new Date().toISOString();
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
    return post;
  }

  updatePostInstance(updateModel: PostUpdateModel) {
    const { title, shortDescription, content } = updateModel;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
  }

  updateLikesCount(
    newLikesCount: number,
    newDislikesCount: number,
    likeStatus?: LikeStatusEnum,
  ) {
    if (likeStatus) {
      switch (likeStatus) {
        case LikeStatusEnum.Like:
          ++this.extendedLikesInfo.likesCount;
          break;
        case LikeStatusEnum.Dislike:
          ++this.extendedLikesInfo.dislikesCount;
          break;
      }
      return;
    }

    this.extendedLikesInfo.likesCount += newLikesCount;
    this.extendedLikesInfo.dislikesCount += newDislikesCount;
  }
}

export const PostSchema: MongooseSchema<Post> =
  SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostDocumentType = HydratedDocument<Post>;

type PostModelStaticType = {
  createPostInstance: (
    inputModel: PostInputModel,
    blogName: string,
  ) => PostDocumentType;
};
export type PostModelType = Model<PostDocumentType> & PostModelStaticType;
