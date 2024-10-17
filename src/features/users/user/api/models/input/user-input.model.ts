import { BaseSorting } from '../../../../../../base/sorting/base-sorting';
import { validationRules } from '../../../../../../core/utils/validation-rules/validation-rules';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class UserInputModel {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(validationRules.login.MIN_LENGTH, validationRules.login.MAX_LENGTH)
  @Matches(validationRules.login.PATTERN)
  @ApiProperty({
    description: 'Unique login for the user',
    example: 'user123',
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
    description: 'Password for the user account',
    example: 'P@ssw0rd123',
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
    description: 'Email address for the user',
    example: 'user@example.com',
    type: String,
    pattern: validationRules.email.PATTERN,
  })
  public email: string;
}

export class UserSortingQuery extends BaseSorting {
  @ApiProperty({
    description: 'The login term to search for users',
    example: 'user123',
    type: String,
    required: false,
  })
  public readonly searchLoginTerm: string;

  @ApiProperty({
    description: 'The email term to search for users',
    example: 'email@example.com',
    type: String,
    required: false,
  })
  public readonly searchEmailTerm: string;

  constructor() {
    super();
  }

  public createUserQuery(query: UserSortingQuery) {
    const baseQuery = this.createBaseQuery(query);
    return {
      ...baseQuery,
      searchLoginTerm: query?.searchLoginTerm ?? '',
      searchEmailTerm: query?.searchEmailTerm ?? '',
    };
  }
}
