import { validationRules } from '../../../../../../core/utils/validation-rules/validation-rules';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { LoginOrEmail } from '../../../../../../core/decorators/transform/loginOrEmail';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputModel {
  @Trim()
  @IsNotEmpty()
  @LoginOrEmail()
  @ApiProperty({
    description: 'Uniq user email or login',
    example: 'email@mail.com',
    type: String,
  })
  public loginOrEmail: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.password.MIN_LENGTH,
    validationRules.password.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Correct user password',
    example: 'qwerty',
    type: String,
    minLength: validationRules.password.MIN_LENGTH,
    maxLength: validationRules.password.MAX_LENGTH,
  })
  public password: string;
}

export class RegistrationInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.login.MIN_LENGTH, validationRules.login.MAX_LENGTH)
  @Matches(validationRules.login.PATTERN)
  @ApiProperty({
    description: 'Uniq user login',
    example: 'login',
    type: String,
    minLength: validationRules.login.MIN_LENGTH,
    maxLength: validationRules.login.MAX_LENGTH,
    pattern: validationRules.login.PATTERN,
  })
  public login: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.password.MIN_LENGTH,
    validationRules.password.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Correct user password',
    example: 'qwerty',
    type: String,
    minLength: validationRules.password.MIN_LENGTH,
    maxLength: validationRules.password.MAX_LENGTH,
  })
  public password: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(validationRules.email.PATTERN)
  @ApiProperty({
    description: 'Uniq user email',
    example: 'email@mail.com',
    type: String,
    pattern: validationRules.email.PATTERN,
  })
  public email: string;
}

export class ConfirmUserByEmailInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Code for confirm user by email address',
    example: 'some-code-for-confirm',
    type: String,
  })
  public code: string;
}

export class ResendConfirmationCodeInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(validationRules.email.PATTERN)
  @ApiProperty({
    description: 'Uniq user email',
    example: 'email@mail.com',
    type: String,
    pattern: validationRules.email.PATTERN,
  })
  public email: string;
}

export class PasswordRecoveryInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(validationRules.email.PATTERN)
  @ApiProperty({
    description: 'Uniq user email',
    example: 'email@mail.com',
    type: String,
    pattern: validationRules.email.PATTERN,
  })
  public email: string;
}

export class ChangePasswordInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    validationRules.password.MIN_LENGTH,
    validationRules.password.MAX_LENGTH,
  )
  @ApiProperty({
    description: 'Correct user password',
    example: 'qwerty',
    type: String,
    minLength: validationRules.password.MIN_LENGTH,
    maxLength: validationRules.password.MAX_LENGTH,
  })
  public newPassword: string;
  @Trim()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Code for change password',
    example: 'some-code-for-change-password',
    type: String,
  })
  public recoveryCode: string;
}
