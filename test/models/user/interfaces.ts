export interface IUserCreateTestModel {
  login: string;
  password: string;
  email: string;
}

export interface IUserLoginTestModel {
  loginOrEmail: string;
  password: string;
}

export interface IUserChangePasswordTestModel {
  newPassword: string;
  recoveryCode: string;
}

export interface IUserRegistrationTestModel {
  login: string;
  password: string;
  email: string;
}

export interface IUserConfirmationEmailTestModel {
  code: string;
}

export interface IUserResendConfirmationCodeEmailTestModel {
  email: string;
}

export interface IUserPasswordRecoveryTestModel {
  email: string;
}

export interface IUserInsertTestModel {
  login: string;
  password: string;
  email: string;
  userConfirm: {
    isConfirm: boolean;
    confirmationCode: string;
    dataExpire: string;
  };
}
