import { ITestSettings } from '../../settings/interfaces';
import {
  IUserChangePasswordTestModel,
  IUserCreateTestModel,
  IUserInsertTestModel,
  IUserLoginTestModel,
  IUserPasswordRecoveryTestModel,
  IUserResendConfirmationCodeEmailTestModel,
} from '../../models/user/interfaces';
import { initSettings } from '../../settings/test-settings';
import { AuthTestManager } from '../../utils/request-test-manager/auth-test-manager';
import { addDays, subDays } from 'date-fns';
import { NodeMailerMockService } from '../../mock/nodemailer-mock';
import { NodeMailerService } from '../../../src/features/nodemailer/application/nodemailer-application';
import { IAuthRecoveryPasswordSessionInsertModel } from '../../models/auth/interfaces';

describe('Auth e2e', () => {
  let testSettings: ITestSettings;
  let authTestManager: AuthTestManager;
  let userRegistrationModel: IUserCreateTestModel;
  let userResendConfirmCodeModel: IUserResendConfirmationCodeEmailTestModel;
  let userInsertModel: IUserInsertTestModel;
  let nodemailerMockService: NodeMailerMockService;
  let userPasswordRecoveryModel: IUserPasswordRecoveryTestModel;
  let passwordRecoverySessionInsertModel: IAuthRecoveryPasswordSessionInsertModel;
  let passwordChangeModel: IUserChangePasswordTestModel;
  let uesrLoginModel: IUserLoginTestModel;

  beforeAll(async () => {
    testSettings = await initSettings();
    nodemailerMockService =
      testSettings.testingAppModule.get<NodeMailerService>(NodeMailerService);
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    userRegistrationModel =
      testSettings.testModels.userTestModel.getUserRegistrationModel();
    userInsertModel =
      testSettings.testModels.userTestModel.getUserInsertModel();
    authTestManager = testSettings.testManager.authTestManager;
    userResendConfirmCodeModel =
      testSettings.testModels.userTestModel.getUserResendConfirmationCodeEmailModel();
    userPasswordRecoveryModel =
      testSettings.testModels.userTestModel.getUserPasswordRecoveryModel();
    passwordRecoverySessionInsertModel =
      testSettings.testModels.authTestModel.getRecoveryPasswordSessionInsertModel();
    passwordChangeModel =
      testSettings.testModels.userTestModel.getUserChangePasswordModel();
    uesrLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
  });

  describe('Get user', () => {
    it('should get current user by access token', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );
      const { accessToken } = await authTestManager.login(uesrLoginModel, 200);

      const result = await authTestManager.getCurrentUser(
        `Bearer ${accessToken}`,
        200,
      );

      expect(result).toEqual({
        login: userInsertModel.login,
        email: userInsertModel.email,
        userId: userId.toString(),
      });
    });

    it('should not get current user by access token, token is not correct', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const { accessToken } = await authTestManager.login(uesrLoginModel, 200);
      await authTestManager.getCurrentUser(`Bearer token`, 401);
      await authTestManager.getCurrentUser(`Basic ${accessToken}`, 401);
    });
  });

  describe('Login', () => {
    it('should login user, and return access token', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result = await authTestManager.login(uesrLoginModel, 200);
      expect(result).toEqual({
        accessToken: expect.any(String),
      });
    });

    it('should not login user, bad input model', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result = await authTestManager.login(
        { ...uesrLoginModel, password: '', loginOrEmail: '' },
        400,
      );
      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'loginOrEmail',
          },
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });

      const withPassword = await authTestManager.login(
        { ...uesrLoginModel, password: '' },
        400,
      );
      expect(withPassword).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });

      const withLoginOrEmail = await authTestManager.login(
        { ...uesrLoginModel, loginOrEmail: '' },
        400,
      );
      expect(withLoginOrEmail).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'loginOrEmail',
          },
        ],
      });
    });

    it('should not login user, user not found', async () => {
      await authTestManager.login(uesrLoginModel, 401);
    });

    it('should not login user, user is not confirm', async () => {
      await testSettings.dataBase.dbInsertOne('users', {
        ...userInsertModel,
        userConfirm: { ...userInsertModel.userConfirm, isConfirm: false },
      });

      const result = await authTestManager.login(uesrLoginModel, 400);
      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'code',
          },
        ],
      });
    });

    it('should not login user, password is not correct', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      await authTestManager.login(
        { ...uesrLoginModel, password: 'otherPass' },
        401,
      );
    });

    it('should login user, and return access token, refresh token into cookie', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result = await authTestManager.loginAndCheckCookie(
        uesrLoginModel,
        200,
      );
      expect(result).toEqual({
        accessToken: expect.any(String),
      });
    });
  });

  describe('Registration', () => {
    it('should registration user', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      await authTestManager.registration(userRegistrationModel, 204);

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not registration user, bad input data', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      const result = await authTestManager.registration(
        { login: '', email: '', password: '' },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
          {
            message: expect.any(String),
            field: 'password',
          },
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      const withLogin = await authTestManager.registration(
        { login: '', email: 'mail@mail.ru', password: 'password' },
        400,
      );

      expect(withLogin).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });

      const withEmail = await authTestManager.registration(
        { login: 'login', email: 'mail@', password: 'password' },
        400,
      );

      expect(withEmail).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      const withPassword = await authTestManager.registration(
        { login: 'login', email: 'mail@mail.ru', password: '' },
        400,
      );

      expect(withPassword).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not registration user, email and login not uniq', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result = await authTestManager.registration(
        userRegistrationModel,
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      const withLogin = await authTestManager.registration(
        { ...userRegistrationModel, email: 'otheremail@mail.ru' },
        400,
      );

      expect(withLogin).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });

      const withEmail = await authTestManager.registration(
        { ...userRegistrationModel, login: 'other' },
        400,
      );

      expect(withEmail).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should confirm email', async () => {
      await testSettings.dataBase.dbInsertOne('users', {
        ...userInsertModel,
        userConfirm: {
          ...userInsertModel.userConfirm,
          isConfirm: false,
          dataExpire: addDays(new Date(), 1),
        },
      });

      await authTestManager.confirmRegistration(
        { code: userInsertModel.userConfirm.confirmationCode },
        204,
      );
    });

    it('should not confirm email, bad input data', async () => {
      const result = await authTestManager.confirmRegistration(
        { code: '' },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'code',
          },
        ],
      });
    });

    it('should not confirm email, code not found', async () => {
      const result = await authTestManager.confirmRegistration(
        { code: 'some-code' },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'code',
          },
        ],
      });
    });

    it('should not confirm email, email has benn confirmed', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result = await authTestManager.confirmRegistration(
        { code: userInsertModel.userConfirm.confirmationCode },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'code',
          },
        ],
      });
    });

    it('should not confirm email, code has benn expired', async () => {
      await testSettings.dataBase.dbInsertOne('users', {
        ...userInsertModel,
        userConfirm: {
          ...userInsertModel.userConfirm,
          isConfirm: false,
          dataExpire: subDays(new Date(), 1),
        },
      });

      const result = await authTestManager.confirmRegistration(
        { code: userInsertModel.userConfirm.confirmationCode },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'code',
          },
        ],
      });
    });

    it('should resend confirmation code', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      await testSettings.dataBase.dbInsertOne('users', {
        ...userInsertModel,
        userConfirm: {
          ...userInsertModel.userConfirm,
          isConfirm: false,
          dataExpire: addDays(new Date(), 1),
        },
      });

      await authTestManager.resendConfirmationCode(
        userResendConfirmCodeModel,
        204,
      );

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not resend confirmation code, bad input data', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      const result = await authTestManager.resendConfirmationCode(
        { email: 'bad' },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not resend confirmation code, email not found', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      const result = await authTestManager.resendConfirmationCode(
        userResendConfirmCodeModel,
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not resend confirmation code, email has been confirmed', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result = await authTestManager.resendConfirmationCode(
        userResendConfirmCodeModel,
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });
  });

  describe('Recovery password', () => {
    it('should send recovery password email', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      await authTestManager.recoveryPassword(userPasswordRecoveryModel, 204);

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not send recovery password email, bad input model', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result = await authTestManager.recoveryPassword(
        { email: 'ema' },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should change user`s password', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      await testSettings.dataBase.dbInsertOne(
        'recoverypasswordsessions',
        passwordRecoverySessionInsertModel,
      );

      await authTestManager.login(uesrLoginModel, 200);

      await authTestManager.changePassword(passwordChangeModel, 204);

      await authTestManager.login(uesrLoginModel, 401);

      await authTestManager.login(
        { ...uesrLoginModel, password: passwordChangeModel.newPassword },
        200,
      );
    });

    it('should not change user`s password, bad input model', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      await testSettings.dataBase.dbInsertOne(
        'recoverypasswordsessions',
        passwordRecoverySessionInsertModel,
      );

      await authTestManager.login(uesrLoginModel, 200);

      const result = await authTestManager.changePassword(
        { newPassword: '', recoveryCode: '' },
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'newPassword',
          },
          {
            message: expect.any(String),
            field: 'recoveryCode',
          },
        ],
      });

      await authTestManager.login(uesrLoginModel, 200);

      await authTestManager.login(
        { ...uesrLoginModel, password: passwordChangeModel.newPassword },
        401,
      );
    });

    it('should not change user`s password, recovery session not found', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      await authTestManager.login(uesrLoginModel, 200);

      const result = await authTestManager.changePassword(
        passwordChangeModel,
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'recoveryCode',
          },
        ],
      });

      await authTestManager.login(uesrLoginModel, 200);

      await authTestManager.login(
        { ...uesrLoginModel, password: passwordChangeModel.newPassword },
        401,
      );
    });

    it('should not change user`s password, recovery session has benn expired', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      await testSettings.dataBase.dbInsertOne('recoverypasswordsessions', {
        ...passwordRecoverySessionInsertModel,
        expAt: subDays(new Date(), 2),
      });

      await authTestManager.login(uesrLoginModel, 200);

      const result = await authTestManager.changePassword(
        passwordChangeModel,
        400,
      );

      expect(result).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'recoveryCode',
          },
        ],
      });

      await authTestManager.login(uesrLoginModel, 200);

      await authTestManager.login(
        { ...uesrLoginModel, password: passwordChangeModel.newPassword },
        401,
      );
    });

    it('should not change user`s password, user not found', async () => {
      await testSettings.dataBase.dbInsertOne(
        'recoverypasswordsessions',
        passwordRecoverySessionInsertModel,
      );

      await authTestManager.changePassword(passwordChangeModel, 400);
      await authTestManager.login(uesrLoginModel, 401);
      await authTestManager.login(
        { ...uesrLoginModel, password: passwordChangeModel.newPassword },
        401,
      );
    });
  });
});
