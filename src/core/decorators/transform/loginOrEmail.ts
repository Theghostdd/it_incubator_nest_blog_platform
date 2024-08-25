import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validationRules } from '../../utils/validation-rules/validation-rules';

@ValidatorConstraint({ async: false })
export class LoginOrEmailConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false;

    const isLoginValid =
      value.length >= validationRules.login.MIN_LENGTH &&
      value.length <= validationRules.login.MAX_LENGTH &&
      /^[a-zA-Z0-9_-]*$/.test(value);
    const isEmailValid = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);

    return isLoginValid || isEmailValid;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not valid`;
  }
}

export function LoginOrEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: LoginOrEmailConstraint,
    });
  };
}
