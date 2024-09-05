import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocumentType, PostModelType } from '../domain/post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModelType,
  ) {}
  async save(post: PostDocumentType): Promise<void> {
    await post.save();
  }

  async delete(post: PostDocumentType): Promise<void> {
    await post.deleteOne();
  }

  async getPostById(id: string): Promise<PostDocumentType | null> {
    return this.postModel.findOne({ _id: id });
  }
}
