interface IValidationConfig {
  MIN_LENGTH: number | null;
  MAX_LENGTH: number | null;
  PATTERN: string | null;
}

type UuidOptionsType = {
  [key: string]: {
    prefix: string;
    key: string;
  };
};
export class ValidationOption {
  public readonly login: IValidationConfig;
  public readonly title: IValidationConfig;
  public readonly name: IValidationConfig;
  public readonly email: IValidationConfig;
  public readonly password: IValidationConfig;
  public readonly shortDescription: IValidationConfig;
  public readonly content: IValidationConfig;
  public readonly description: IValidationConfig;
  public readonly websiteUrl: IValidationConfig;

  constructor() {
    this.login = { MIN_LENGTH: 3, MAX_LENGTH: 10, PATTERN: '^[a-zA-Z0-9_-]*$' };
    this.title = { MIN_LENGTH: 1, MAX_LENGTH: 30, PATTERN: null };
    this.name = { MIN_LENGTH: 1, MAX_LENGTH: 15, PATTERN: null };
    this.email = {
      MIN_LENGTH: null,
      MAX_LENGTH: null,
      PATTERN: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    };
    this.password = { MIN_LENGTH: 6, MAX_LENGTH: 20, PATTERN: null };
    this.shortDescription = {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
      PATTERN: null,
    };
    this.content = { MIN_LENGTH: 1, MAX_LENGTH: 1000, PATTERN: null };
    this.description = { MIN_LENGTH: 1, MAX_LENGTH: 500, PATTERN: null };
    this.websiteUrl = {
      MIN_LENGTH: 13,
      MAX_LENGTH: 100,
      PATTERN: '^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$',
    };
  }
}
export class StaticOptions {
  public readonly uuidOptions: UuidOptionsType;
  constructor() {
    this.uuidOptions = {
      confirmationEmail: {
        prefix: 'c-c_',
        key: new Date().getTime().toString(),
      },
      newConfirmationCode: {
        prefix: 'n-c-c_',
        key: new Date().getTime().toString(),
      },
      recoveryPasswordSessionCode: {
        prefix: 'r-p-s-c_',
        key: new Date().getTime().toString(),
      },
    };
  }
}
export class SuperAdminAuth {
  public readonly login: string;
  public readonly password: string;
  constructor() {
    this.login = 'admin';
    this.password = 'qwerty';
  }
}

export class StaticOption {
  constructor(
    public readonly validationOption: ValidationOption,
    public readonly superAdminAuth: SuperAdminAuth,
    public readonly staticOptions: StaticOptions,
  ) {
    this.validationOption = validationOption;
    this.superAdminAuth = superAdminAuth;
    this.staticOptions = staticOptions;
  }
}

const validationOption = new ValidationOption();
const superAdminAuth = new SuperAdminAuth();
const staticOptions = new StaticOptions();
export const staticOption = new StaticOption(
  validationOption,
  superAdminAuth,
  staticOptions,
);
