import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Trim } from '../../decorators/transform/trim';
import { appSettings } from '../../../settings/app-setting';

export class UserInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.login.MIN_LENGTH,
    appSettings.staticSettings.login.MAX_LENGTH,
  )
  @Matches(appSettings.staticSettings.login.PATTERN)
  public login: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.password.MIN_LENGTH,
    appSettings.staticSettings.password.MAX_LENGTH,
  )
  public password: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(appSettings.staticSettings.email.PATTERN)
  public email: string;
}

export class PostInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.title.MIN_LENGTH,
    appSettings.staticSettings.title.MAX_LENGTH,
  )
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.shortDescription.MIN_LENGTH,
    appSettings.staticSettings.shortDescription.MAX_LENGTH,
  )
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.content.MIN_LENGTH,
    appSettings.staticSettings.content.MAX_LENGTH,
  )
  public content: string;
  @Trim()
  @IsNotEmpty()
  @IsMongoId()
  public blogId: string;
}

export class PostUpdateModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.title.MIN_LENGTH,
    appSettings.staticSettings.title.MAX_LENGTH,
  )
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.shortDescription.MIN_LENGTH,
    appSettings.staticSettings.shortDescription.MAX_LENGTH,
  )
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.content.MIN_LENGTH,
    appSettings.staticSettings.content.MAX_LENGTH,
  )
  public content: string;
  @Trim()
  @IsNotEmpty()
  @IsMongoId()
  public blogId: string;
}

export class PostBlogInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.title.MIN_LENGTH,
    appSettings.staticSettings.title.MAX_LENGTH,
  )
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.shortDescription.MIN_LENGTH,
    appSettings.staticSettings.shortDescription.MAX_LENGTH,
  )
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.content.MIN_LENGTH,
    appSettings.staticSettings.content.MAX_LENGTH,
  )
  public content: string;
}

export class BlogInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.name.MIN_LENGTH,
    appSettings.staticSettings.name.MAX_LENGTH,
  )
  public name: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.description.MIN_LENGTH,
    appSettings.staticSettings.description.MAX_LENGTH,
  )
  public description: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.websiteUrl.MIN_LENGTH,
    appSettings.staticSettings.websiteUrl.MAX_LENGTH,
  )
  @Matches(appSettings.staticSettings.websiteUrl.PATTERN)
  public websiteUrl: string;
}

export class BlogUpdateModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.name.MIN_LENGTH,
    appSettings.staticSettings.name.MAX_LENGTH,
  )
  public name: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.description.MIN_LENGTH,
    appSettings.staticSettings.description.MAX_LENGTH,
  )
  public description: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.websiteUrl.MIN_LENGTH,
    appSettings.staticSettings.websiteUrl.MAX_LENGTH,
  )
  @Matches(appSettings.staticSettings.websiteUrl.PATTERN)
  public websiteUrl: string;
}
