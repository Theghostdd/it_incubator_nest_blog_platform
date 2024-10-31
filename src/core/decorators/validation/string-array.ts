import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
@ValidatorConstraint({ async: false })
export class StringArrayConstraint implements ValidatorConstraintInterface {
  validate(value: string[]) {
    if (!value || value.length <= 0) return false;

    for (const v of value) {
      if (typeof v !== 'string') return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not valid`;
  }
}

export function IsStringArray(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: StringArrayConstraint,
    });
  };
}
