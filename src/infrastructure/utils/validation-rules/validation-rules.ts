import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Trim } from '../../decorators/transform/trim';
import { appSettings } from '../../../settings/app-setting';
import { LoginOrEmail } from '../../decorators/transform/loginOrEmail';

export class UserInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.login.MIN_LENGTH,
    appSettings.staticSettings.validationOption.login.MAX_LENGTH,
  )
  @Matches(appSettings.staticSettings.validationOption.login.PATTERN)
  public login: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.password.MIN_LENGTH,
    appSettings.staticSettings.validationOption.password.MAX_LENGTH,
  )
  public password: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(appSettings.staticSettings.validationOption.email.PATTERN)
  public email: string;
}

export class PostInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.title.MIN_LENGTH,
    appSettings.staticSettings.validationOption.title.MAX_LENGTH,
  )
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.shortDescription.MIN_LENGTH,
    appSettings.staticSettings.validationOption.shortDescription.MAX_LENGTH,
  )
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.content.MIN_LENGTH,
    appSettings.staticSettings.validationOption.content.MAX_LENGTH,
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
    appSettings.staticSettings.validationOption.title.MIN_LENGTH,
    appSettings.staticSettings.validationOption.title.MAX_LENGTH,
  )
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.shortDescription.MIN_LENGTH,
    appSettings.staticSettings.validationOption.shortDescription.MAX_LENGTH,
  )
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.content.MIN_LENGTH,
    appSettings.staticSettings.validationOption.content.MAX_LENGTH,
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
    appSettings.staticSettings.validationOption.title.MIN_LENGTH,
    appSettings.staticSettings.validationOption.title.MAX_LENGTH,
  )
  public title: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.shortDescription.MIN_LENGTH,
    appSettings.staticSettings.validationOption.shortDescription.MAX_LENGTH,
  )
  public shortDescription: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.content.MIN_LENGTH,
    appSettings.staticSettings.validationOption.content.MAX_LENGTH,
  )
  public content: string;
}

export class BlogInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.name.MIN_LENGTH,
    appSettings.staticSettings.validationOption.name.MAX_LENGTH,
  )
  public name: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.description.MIN_LENGTH,
    appSettings.staticSettings.validationOption.description.MAX_LENGTH,
  )
  public description: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.websiteUrl.MIN_LENGTH,
    appSettings.staticSettings.validationOption.websiteUrl.MAX_LENGTH,
  )
  @Matches(appSettings.staticSettings.validationOption.websiteUrl.PATTERN)
  public websiteUrl: string;
}

export class BlogUpdateModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.name.MIN_LENGTH,
    appSettings.staticSettings.validationOption.name.MAX_LENGTH,
  )
  public name: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.description.MIN_LENGTH,
    appSettings.staticSettings.validationOption.description.MAX_LENGTH,
  )
  public description: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.websiteUrl.MIN_LENGTH,
    appSettings.staticSettings.validationOption.websiteUrl.MAX_LENGTH,
  )
  @Matches(appSettings.staticSettings.validationOption.websiteUrl.PATTERN)
  public websiteUrl: string;
}

export class LoginInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @LoginOrEmail()
  public loginOrEmail: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.password.MIN_LENGTH,
    appSettings.staticSettings.validationOption.password.MAX_LENGTH,
  )
  public password: string;
}

export class RegistrationInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.login.MIN_LENGTH,
    appSettings.staticSettings.validationOption.login.MAX_LENGTH,
  )
  @Matches(appSettings.staticSettings.validationOption.login.PATTERN)
  public login: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.password.MIN_LENGTH,
    appSettings.staticSettings.validationOption.password.MAX_LENGTH,
  )
  public password: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(appSettings.staticSettings.validationOption.email.PATTERN)
  public email: string;
}

export class ConfirmUserByEmailInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  public code: string;
}

export class ResendConfirmationCodeInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(appSettings.staticSettings.validationOption.email.PATTERN)
  public email: string;
}

export class PasswordRecoveryInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(appSettings.staticSettings.validationOption.email.PATTERN)
  public email: string;
}

export class ChangePasswordInputModelValidationRules {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    appSettings.staticSettings.validationOption.password.MIN_LENGTH,
    appSettings.staticSettings.validationOption.password.MAX_LENGTH,
  )
  public newPassword: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  public recoveryCode: string;
}
