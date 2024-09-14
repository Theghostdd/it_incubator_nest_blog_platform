export class UserTestModel {
  private readonly login: string;
  private readonly email: string;
  private readonly password: string;
  private readonly newPassword: string;
  private readonly confirmationCode: string;
  private readonly recoveryPasswordSessionCode: string;
  constructor() {
    this.login = 'user1';
    this.email = 'user1@example.com';
    this.password = 'myPassword';
    this.newPassword = 'myNewPassword';
    this.confirmationCode = 'this-confirmation-code';
    this.recoveryPasswordSessionCode = 'my-recovery-code';
  }

  getUserCreateModel() {
    return {
      login: this.login,
      email: this.email,
      password: this.password,
    };
  }

  getUserLoginModel() {
    return {
      loginOrEmail: this.login,
      password: this.password,
    };
  }

  getUserChangePasswordModel() {
    return {
      newPassword: this.newPassword,
      recoveryCode: this.recoveryPasswordSessionCode,
    };
  }

  getUserRegistrationModel() {
    return {
      login: this.login,
      password: this.password,
      email: this.email,
    };
  }

  getUserConfirmationEmailModel() {
    return {
      code: this.confirmationCode,
    };
  }

  getUserResendConfirmationCodeEmailModel() {
    return {
      email: this.email,
    };
  }

  getUserPasswordRecoveryModel() {
    return {
      email: this.email,
    };
  }
}
