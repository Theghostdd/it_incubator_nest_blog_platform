import { Injectable } from '@nestjs/common';
import { CommentRepositories } from '../infrastructure/comment-repositories';
import { CommentType } from '../domain/comment.entity';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../base/types/types';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepositories: CommentRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async getCommentById(id: number): Promise<AppResultType<CommentType>> {
    const comment: CommentType | null =
      await this.commentRepositories.getCommentById(id);
    if (!comment) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(comment);
  }
}
