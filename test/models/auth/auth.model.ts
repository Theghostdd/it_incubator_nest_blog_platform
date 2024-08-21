import { addMinutes } from 'date-fns';

export class AuthTestModel {
  constructor(
    private readonly userEmail: string,
    private readonly recoveryPasswordCode: string,
  ) {
    this.recoveryPasswordCode = recoveryPasswordCode;
    this.userEmail = userEmail;
  }

  getRecoveryPasswordSessionInsertModel() {
    return {
      email: this.userEmail,
      code: this.recoveryPasswordCode,
      expAt: addMinutes(new Date(), 20).toISOString(),
    };
  }
}
