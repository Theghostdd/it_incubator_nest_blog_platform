import { UuidOptionsType } from './types/types';

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

export const staticOptions = new StaticOptions();
