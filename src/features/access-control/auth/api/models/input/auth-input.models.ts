import {
  ChangePasswordInputModelValidationRules,
  ConfirmUserByEmailInputModelValidationRules,
  LoginInputModelValidationRules,
  PasswordRecoveryInputModelValidationRules,
  RegistrationInputModelValidationRules,
  ResendConfirmationCodeInputModelValidationRules,
} from '../../../../../../core/utils/validation-rules/validation-rules';

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

export class PasswordRecoveryInputModel extends PasswordRecoveryInputModelValidationRules {
  public email: string;
}

export class ChangePasswordInputModel extends ChangePasswordInputModelValidationRules {
  public newPassword: string;
  public recoveryCode: string;
}
