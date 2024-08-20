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

  getUserInsertModel() {
    return {
      login: this.login,
      email: this.email,
      password: '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
      userConfirm: {
        isConfirm: true,
        confirmationCode: this.confirmationCode,
        dataExpire: '0',
      },
      createdAt: new Date().toISOString(),
      __v: 0,
    };
  }

  getUserInsertManyModel() {
    return [
      {
        login: this.login,
        email: this.email,
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u2',
        email: this.email + 'u2',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u3',
        email: this.email + 'u3',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u4',
        email: this.email + 'u4',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u5',
        email: this.email + 'u5',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u6',
        email: this.email + 'u6',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u7',
        email: this.email + 'u7',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u8',
        email: this.email + 'u8',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u9',
        email: this.email + 'u9',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: this.login + 'u10',
        email: this.email + 'u10',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },

      {
        login: 'miska',
        email: 'miska@mail.ru',
        password:
          '$2b$10$/4OEJdfr34fqIgweLDRmDef83aAWdDdM8Pa6CbQ.nQpSRKxppfeQK',
        userConfirm: {
          isConfirm: true,
          confirmationCode: this.confirmationCode,
          dataExpire: '0',
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
    ];
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
