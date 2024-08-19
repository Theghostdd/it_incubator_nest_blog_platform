import {
  ConfirmUserByEmailInputModelValidationRules,
  LoginInputModelValidationRules,
  RegistrationInputModelValidationRules,
  ResendConfirmationCodeInputModelValidationRules,
} from '../../../../../infrastructure/utils/validation-rules/validation-rules';

export class LoginInputModel extends LoginInputModelValidationRules {
  public loginOrEmail: string;
  public password: string;
}

export class RegistrationInputModel extends RegistrationInputModelValidationRules {
  public login: string;
  public password: string;
  public email: string;
}

export class ConfirmUserByEmailInputModel extends ConfirmUserByEmailInputModelValidationRules {
  public code: string;
}

export class ResendConfirmationCodeInputModel extends ResendConfirmationCodeInputModelValidationRules {
  public email: string;
}
