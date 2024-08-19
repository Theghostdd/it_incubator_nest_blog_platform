import {
  LoginInputModelValidationRules,
  RegistrationInputModelValidationRules,
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
