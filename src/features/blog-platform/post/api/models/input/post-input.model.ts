import { validationRules } from '../../../../../../core/utils/validation-rules/validation-rules';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { TransformNumber } from '../../../../../../core/decorators/transform/number';
import { FindBlog } from '../../../../../../core/decorators/find-blog';
import { ApiProperty } from '@nestjs/swagger';

export class PostInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
  @ApiProperty({
    description: 'Title of the post',
    example: 'Understanding the Basics of TypeScript',
    type: String,
    minLength: validationRules.title.MIN_LENGTH,
    maxLength: validationRules.title.MAX_LENGTH,
  })
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.shortDescription.MIN_LENGTH,
    validationRules.shortDescription.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'A brief description of the post',
    example:
      'This post covers the fundamental concepts of TypeScript and its benefits over JavaScript.',
    type: String,
    minLength: validationRules.shortDescription.MIN_LENGTH,
    maxLength: validationRules.shortDescription.MAX_LENGTH,
  })
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.content.MIN_LENGTH,
    validationRules.content.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Full content of the post',
    example:
      'TypeScript is a superset of JavaScript that adds static typing...',
    type: String,
    minLength: validationRules.content.MIN_LENGTH,
    maxLength: validationRules.content.MAX_LENGTH,
  })
  public content: string;
  @Trim()
  @IsNotEmpty()
  @TransformNumber()
  @IsNumber()
  @FindBlog()
  @ApiProperty({
    description: 'Identifier of the blog to which the post belongs',
    example: 1,
    type: Number,
  })
  public blogId: number;
}

export class PostUpdateModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
  @ApiProperty({
    description: 'Title of the post',
    example: 'Understanding the Basics of TypeScript',
    type: String,
    minLength: validationRules.title.MIN_LENGTH,
    maxLength: validationRules.title.MAX_LENGTH,
  })
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.shortDescription.MIN_LENGTH,
    validationRules.shortDescription.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'A brief description of the post',
    example:
      'This post covers the fundamental concepts of TypeScript and its benefits over JavaScript.',
    type: String,
    minLength: validationRules.shortDescription.MIN_LENGTH,
    maxLength: validationRules.shortDescription.MAX_LENGTH,
  })
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.content.MIN_LENGTH,
    validationRules.content.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Full content of the post',
    example:
      'TypeScript is a superset of JavaScript that adds static typing...',
    type: String,
    minLength: validationRules.content.MIN_LENGTH,
    maxLength: validationRules.content.MAX_LENGTH,
  })
  public content: string;
  @Trim()
  @IsNotEmpty()
  @TransformNumber()
  @IsNumber()
  @FindBlog()
  @ApiProperty({
    description: 'Identifier of the blog to which the post belongs',
    example: 1,
    type: Number,
  })
  public blogId: number;
}
