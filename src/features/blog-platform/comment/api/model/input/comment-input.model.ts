import { validationRules } from '../../../../../../core/utils/validation-rules/validation-rules';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.content_to_comment.MIN_LENGTH,
    validationRules.content_to_comment.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is an insightful article, thank you for sharing!',
    type: String,
    minLength: validationRules.content_to_comment.MIN_LENGTH,
    maxLength: validationRules.content_to_comment.MAX_LENGTH,
  })
  public content: string;
}

export class CommentUpdateModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.content_to_comment.MIN_LENGTH,
    validationRules.content_to_comment.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is an insightful article, thank you for sharing!',
    type: String,
    minLength: validationRules.content_to_comment.MIN_LENGTH,
    maxLength: validationRules.content_to_comment.MAX_LENGTH,
  })
  public content: string;
}
