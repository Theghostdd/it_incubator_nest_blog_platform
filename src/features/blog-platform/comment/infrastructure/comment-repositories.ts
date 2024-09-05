import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocumentType,
  CommentModelType,
} from '../domain/comment.entity';

@Injectable()
export class CommentRepositories {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
  ) {}
  async save(comment: CommentDocumentType): Promise<void> {
    await comment.save();
  }

  async delete(comment: CommentDocumentType): Promise<void> {
    await comment.deleteOne();
  }

  async getCommentById(id: string): Promise<CommentDocumentType | null> {
    return this.commentModel.findOne({ _id: id });
  }
}
