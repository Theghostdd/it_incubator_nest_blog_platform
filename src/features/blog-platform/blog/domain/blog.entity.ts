import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  BlogInputModel,
  BlogUpdateModel,
} from '../api/models/input/blog-input.model';

@Schema()
export class Blog {
  @Prop({ type: String, required: true, min: 1, max: 15, unique: false })
  name: string;
  @Prop({ type: String, required: true, min: 1, max: 500, unique: false })
  description: string;
  @Prop({ type: String, required: true, min: 13, max: 100, unique: false })
  websiteUrl: string;
  @Prop({ type: String, required: true, default: new Date().toISOString() })
  createdAt: string;
  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  static createBlogInstance(inputModel: BlogInputModel) {
    const { websiteUrl, description, name } = inputModel;
    const blog = new this();
    blog.websiteUrl = websiteUrl;
    blog.description = description;
    blog.name = name;
    blog.isMembership = false;
    blog.createdAt = new Date().toISOString();
    return blog;
  }

  updateBlogInstance(updateModel: BlogUpdateModel) {
    const { name, description, websiteUrl } = updateModel;
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type BlogDocumentType = HydratedDocument<Blog>;

type BlogModelStaticType = {
  createBlogInstance: (inputModel: BlogInputModel) => BlogDocumentType;
};
export type BlogModelType = Model<BlogDocumentType> & BlogModelStaticType;
