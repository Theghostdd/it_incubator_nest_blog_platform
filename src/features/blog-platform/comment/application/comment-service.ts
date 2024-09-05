import { Injectable } from '@nestjs/common';
import { CommentRepositories } from '../infrastructure/comment-repositories';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { AppResultType } from '../../../../base/types/types';
import { CommentDocumentType } from '../domain/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepositories: CommentRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async commentIsExistById(
    id: string,
  ): Promise<AppResultType<CommentDocumentType>> {
    const comment: CommentDocumentType | null =
      await this.commentRepositories.getCommentById(id);
    if (!comment) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(comment);
  }
}
