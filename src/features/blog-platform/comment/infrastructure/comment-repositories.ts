import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';
import { CommentPropertyEnum } from '../domain/types';

@Injectable()
export class CommentRepositories {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}
  async save(comment: Comment): Promise<number> {
    const commentEntity = await this.commentRepository.save(comment);
    return commentEntity.id;
  }

  async getCommentById(id: number): Promise<Comment | null> {
    return await this.commentRepository.findOne({
      select: [
        CommentPropertyEnum.id,
        CommentPropertyEnum.content,
        CommentPropertyEnum.postId,
        CommentPropertyEnum.userId,
        CommentPropertyEnum.createdAt,
      ],
      where: {
        [CommentPropertyEnum.id]: id,
        [CommentPropertyEnum.isActive]: true,
      },
    });
  }
}
