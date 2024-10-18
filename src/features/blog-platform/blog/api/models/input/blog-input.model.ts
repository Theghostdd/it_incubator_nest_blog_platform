import { BaseSorting } from '../../../../../../base/sorting/base-sorting';
import { validationRules } from '../../../../../../core/utils/validation-rules/validation-rules';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class BlogInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.name.MIN_LENGTH, validationRules.name.MAX_LENGTH)
  @ApiProperty({
    description: 'Name of the blog',
    example: 'Tech Innovations',
    type: String,
    minLength: validationRules.name.MIN_LENGTH,
    maxLength: validationRules.name.MAX_LENGTH,
  })
  public name: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.description.MIN_LENGTH,
    validationRules.description.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Description of the blog',
    example:
      'A blog dedicated to exploring the latest innovations in technology.',
    type: String,
    minLength: validationRules.description.MIN_LENGTH,
    maxLength: validationRules.description.MAX_LENGTH,
  })
  public description: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.websiteUrl.MIN_LENGTH,
    validationRules.websiteUrl.MAX_LENGTH,
  )
  @Matches(validationRules.websiteUrl.PATTERN)
  @ApiProperty({
    description: 'Website URL of the blog',
    example: 'https://www.techinnovations.com',
    type: String,
    minLength: validationRules.websiteUrl.MIN_LENGTH,
    maxLength: validationRules.websiteUrl.MAX_LENGTH,
    pattern: validationRules.websiteUrl.PATTERN,
  })
  public websiteUrl: string;
}

export class BlogUpdateModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.name.MIN_LENGTH, validationRules.name.MAX_LENGTH)
  @ApiProperty({
    description: 'Name of the blog',
    example: 'Tech Innovations',
    type: String,
    minLength: validationRules.name.MIN_LENGTH,
    maxLength: validationRules.name.MAX_LENGTH,
  })
  public name: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.description.MIN_LENGTH,
    validationRules.description.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Description of the blog',
    example:
      'A blog dedicated to exploring the latest innovations in technology.',
    type: String,
    minLength: validationRules.description.MIN_LENGTH,
    maxLength: validationRules.description.MAX_LENGTH,
  })
  public description: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.websiteUrl.MIN_LENGTH,
    validationRules.websiteUrl.MAX_LENGTH,
  )
  @Matches(validationRules.websiteUrl.PATTERN)
  @ApiProperty({
    description: 'Website URL of the blog',
    example: 'https://www.techinnovations.com',
    type: String,
    minLength: validationRules.websiteUrl.MIN_LENGTH,
    maxLength: validationRules.websiteUrl.MAX_LENGTH,
    pattern: validationRules.websiteUrl.PATTERN,
  })
  public websiteUrl: string;
}

export class PostBlogInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
  @ApiProperty({
    description: 'Title of the post',
    example: 'Exploring the Future of AI',
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
      'This post discusses the potential developments in artificial intelligence over the next decade.',
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
    description: 'Content of the post',
    example:
      'Artificial intelligence is rapidly evolving. In the coming years, we can expect significant advancements in...',
    type: String,
    minLength: validationRules.content.MIN_LENGTH,
    maxLength: validationRules.content.MAX_LENGTH,
  })
  public content: string;
}

export class BlogPostUpdateModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
  @ApiProperty({
    description: 'Title of the post',
    example: 'Exploring the Future of AI',
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
      'This post discusses the potential developments in artificial intelligence over the next decade.',
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
    description: 'Content of the post',
    example:
      'Artificial intelligence is rapidly evolving. In the coming years, we can expect significant advancements in...',
    type: String,
    minLength: validationRules.content.MIN_LENGTH,
    maxLength: validationRules.content.MAX_LENGTH,
  })
  public content: string;
}

export class BlogSortingQuery extends BaseSorting {
  @ApiProperty({
    description: 'The name term to search for blog',
    example: 'blog123456',
    type: String,
    required: false,
  })
  public readonly searchNameTerm: string;

  constructor() {
    super();
  }

  public createBlogQuery(query: BlogSortingQuery) {
    const baseQuery = this.createBaseQuery(query);
    return {
      ...baseQuery,
      searchNameTerm: query?.searchNameTerm ?? '',
    };
  }
}
