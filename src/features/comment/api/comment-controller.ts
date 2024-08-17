import { apiPrefixSettings } from '../../../settings/app-prefix-settings';
import { Controller, Get, Param } from '@nestjs/common';
import { CommentQueryRepositories } from '../infrastructure/comment-query-repositories';
import { CommentOutputModel } from './model/output/comment-output.model';

@Controller(apiPrefixSettings.COMMENT.comments)
export class CommentController {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepositories,
  ) {}

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<CommentOutputModel> {
    return await this.commentQueryRepository.getCommentById(id);
  }
}
