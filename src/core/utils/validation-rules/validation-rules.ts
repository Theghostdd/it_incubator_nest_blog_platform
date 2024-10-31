type ValidationOptions = {
  MIN_LENGTH: number | null;
  MAX_LENGTH: number | null;
  PATTERN: string | null;
};

export type ValidationRulesType = {
  [key: string]: ValidationOptions;
};

export const validationRules: ValidationRulesType = {
  login: { MIN_LENGTH: 3, MAX_LENGTH: 10, PATTERN: '^[a-zA-Z0-9_-]*$' },
  title: { MIN_LENGTH: 1, MAX_LENGTH: 30, PATTERN: null },
  name: { MIN_LENGTH: 1, MAX_LENGTH: 15, PATTERN: null },
  email: {
    MIN_LENGTH: null,
    MAX_LENGTH: null,
    PATTERN: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
  },
  password: { MIN_LENGTH: 6, MAX_LENGTH: 20, PATTERN: null },
  shortDescription: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: null,
  },
  content: { MIN_LENGTH: 1, MAX_LENGTH: 1000, PATTERN: null },
  content_to_comment: { MIN_LENGTH: 20, MAX_LENGTH: 300, PATTERN: null },
  description: { MIN_LENGTH: 1, MAX_LENGTH: 500, PATTERN: null },
  websiteUrl: {
    MIN_LENGTH: 13,
    MAX_LENGTH: 100,
    PATTERN: '^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$',
  },
  quizGameQuestionBody: { MIN_LENGTH: 10, MAX_LENGTH: 500, PATTERN: null },
};

// export class UserInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.login.MIN_LENGTH, validationRules.login.MAX_LENGTH)
//   @Matches(validationRules.login.PATTERN)
//   public login: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.password.MIN_LENGTH,
//     validationRules.password.MAX_LENGTH,
//   )
//   public password: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Matches(validationRules.email.PATTERN)
//   public email: string;
// }
//
// export class PostInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
//   public title: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.shortDescription.MIN_LENGTH,
//     validationRules.shortDescription.MAX_LENGTH,
//   )
//   public shortDescription: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.content.MIN_LENGTH,
//     validationRules.content.MAX_LENGTH,
//   )
//   public content: string;
//   @Trim()
//   @IsNotEmpty()
//   @TransformNumber()
//   @IsNumber()
//   @FindBlog()
//   public blogId: number;
// }
//
// export class PostUpdateModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
//   public title: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.shortDescription.MIN_LENGTH,
//     validationRules.shortDescription.MAX_LENGTH,
//   )
//   public shortDescription: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.content.MIN_LENGTH,
//     validationRules.content.MAX_LENGTH,
//   )
//   public content: string;
//   @Trim()
//   @IsNotEmpty()
//   @TransformNumber()
//   @IsNumber()
//   @FindBlog()
//   public blogId: number;
// }
//
// export class BlogPostUpdateModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
//   public title: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.shortDescription.MIN_LENGTH,
//     validationRules.shortDescription.MAX_LENGTH,
//   )
//   public shortDescription: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.content.MIN_LENGTH,
//     validationRules.content.MAX_LENGTH,
//   )
//   public content: string;
// }
//
// export class PostBlogInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.title.MIN_LENGTH, validationRules.title.MAX_LENGTH)
//   public title: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.shortDescription.MIN_LENGTH,
//     validationRules.shortDescription.MAX_LENGTH,
//   )
//   public shortDescription: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.content.MIN_LENGTH,
//     validationRules.content.MAX_LENGTH,
//   )
//   public content: string;
// }
//
// export class BlogInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.name.MIN_LENGTH, validationRules.name.MAX_LENGTH)
//   public name: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.description.MIN_LENGTH,
//     validationRules.description.MAX_LENGTH,
//   )
//   public description: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.websiteUrl.MIN_LENGTH,
//     validationRules.websiteUrl.MAX_LENGTH,
//   )
//   @Matches(validationRules.websiteUrl.PATTERN)
//   public websiteUrl: string;
// }
//
// export class BlogUpdateModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.name.MIN_LENGTH, validationRules.name.MAX_LENGTH)
//   public name: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.description.MIN_LENGTH,
//     validationRules.description.MAX_LENGTH,
//   )
//   public description: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.websiteUrl.MIN_LENGTH,
//     validationRules.websiteUrl.MAX_LENGTH,
//   )
//   @Matches(validationRules.websiteUrl.PATTERN)
//   public websiteUrl: string;
// }
//
// export class LoginInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @LoginOrEmail()
//   public loginOrEmail: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.password.MIN_LENGTH,
//     validationRules.password.MAX_LENGTH,
//   )
//   public password: string;
// }
//
// export class RegistrationInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(validationRules.login.MIN_LENGTH, validationRules.login.MAX_LENGTH)
//   @Matches(validationRules.login.PATTERN)
//   public login: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.password.MIN_LENGTH,
//     validationRules.password.MAX_LENGTH,
//   )
//   public password: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Matches(validationRules.email.PATTERN)
//   public email: string;
// }
//
// export class ConfirmUserByEmailInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   public code: string;
// }
//
// export class ResendConfirmationCodeInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Matches(validationRules.email.PATTERN)
//   public email: string;
// }
//
// export class PasswordRecoveryInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Matches(validationRules.email.PATTERN)
//   public email: string;
// }
//
// export class ChangePasswordInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.password.MIN_LENGTH,
//     validationRules.password.MAX_LENGTH,
//   )
//   public newPassword: string;
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   public recoveryCode: string;
// }
//
// export class CommentInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.content_to_comment.MIN_LENGTH,
//     validationRules.content_to_comment.MAX_LENGTH,
//   )
//   public content: string;
// }
//
// export class CommentUpdateModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsString()
//   @Length(
//     validationRules.content_to_comment.MIN_LENGTH,
//     validationRules.content_to_comment.MAX_LENGTH,
//   )
//   public content: string;
// }
//
// export class LikeInputModelValidationRules {
//   @Trim()
//   @IsNotEmpty()
//   @IsEnum(LikeStatusEnum)
//   public likeStatus: string;
// }
