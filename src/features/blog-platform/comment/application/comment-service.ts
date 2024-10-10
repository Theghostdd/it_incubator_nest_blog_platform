import { Injectable } from '@nestjs/common';
import { CommentRepositories } from '../infrastructure/comment-repositories';
import { Comment } from '../domain/comment.entity';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../base/types/types';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepositories: CommentRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async getCommentById(id: number): Promise<AppResultType<Comment>> {
    const comment: Comment | null =
      await this.commentRepositories.getCommentById(id);
    if (!comment) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(comment);
  }
}
