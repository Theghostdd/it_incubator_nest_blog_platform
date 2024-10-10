import { ITestSettings } from '../../settings/interfaces';
import {
  IUserChangePasswordTestModel,
  IUserCreateTestModel,
  IUserLoginTestModel,
  IUserPasswordRecoveryTestModel,
  IUserResendConfirmationCodeEmailTestModel,
} from '../../models/user/interfaces';
import { initSettings } from '../../settings/test-settings';
import { AuthTestManager } from '../../utils/request-test-manager/auth-test-manager';
import { NodeMailerMockService } from '../../mock/nodemailer-mock';
import { NodeMailerService } from '../../../src/features/nodemailer/application/nodemailer-application';
import { delay } from '../../utils/delay/delay';
import { UserTestManager } from '../../utils/request-test-manager/user-test-manager';
import { APISettings } from '../../../src/settings/api-settings';
import { User } from '../../../src/features/users/user/domain/user.entity';
import { AuthSession } from '../../../src/features/access-control/auth/domain/auth-session.entity';
import { RecoveryPasswordSession } from '../../../src/features/access-control/auth/domain/recovery-session.entity';
import { UserConfirmation } from '../../../src/features/users/user/domain/user-confirm.entity';

describe('Auth e2e', () => {
  let testSettings: ITestSettings;
  let authTestManager: AuthTestManager;
  let userRegistrationModel: IUserCreateTestModel;
  let userResendConfirmCodeModel: IUserResendConfirmationCodeEmailTestModel;
  let nodemailerMockService: NodeMailerMockService;
  let userPasswordRecoveryModel: IUserPasswordRecoveryTestModel;
  let passwordChangeModel: IUserChangePasswordTestModel;
  let uesrLoginModel: IUserLoginTestModel;
  let userTestManager: UserTestManager;
  let userCreateModel: IUserCreateTestModel;
  let apiSettings: APISettings;
  let login: string;
  let password: string;
  let adminAuthToken: string;

  beforeAll(async () => {
    testSettings = await initSettings();
    nodemailerMockService =
      testSettings.testingAppModule.get<NodeMailerService>(NodeMailerService);

    apiSettings = testSettings.configService.get('apiSettings', {
      infer: true,
    });

    login = apiSettings.SUPER_ADMIN_AUTH.login;
    password = apiSettings.SUPER_ADMIN_AUTH.password;
    adminAuthToken = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
  });

  afterAll(async () => {
    await testSettings.app.close();
    // await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    userRegistrationModel =
      testSettings.testModels.userTestModel.getUserRegistrationModel();
    authTestManager = testSettings.testManager.authTestManager;
    userResendConfirmCodeModel =
      testSettings.testModels.userTestModel.getUserResendConfirmationCodeEmailModel();
    userPasswordRecoveryModel =
      testSettings.testModels.userTestModel.getUserPasswordRecoveryModel();
    passwordChangeModel =
      testSettings.testModels.userTestModel.getUserChangePasswordModel();
    uesrLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
    userTestManager = testSettings.testManager.userTestManager;
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
  });

  describe('Get user', () => {
    it('should get current user by access token', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const { accessToken } = await authTestManager.login(uesrLoginModel, 200);

      const result = await authTestManager.getCurrentUser(
        `Bearer ${accessToken}`,
        200,
      );

      expect(result).toEqual({
        login: userCreateModel.login,
        email: userCreateModel.email,
        userId: userId.toString(),
      });
    });

    it('should not get current user by access token, token is not correct', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const { accessToken } = await authTestManager.login(uesrLoginModel, 200);
      await authTestManager.getCurrentUser(`Bearer token`, 401);
      await authTestManager.getCurrentUser(`Basic ${accessToken}`, 401);
    });
  });

  describe('Login', () => {
    it('should login user, and return access token', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const result = await authTestManager.login(uesrLoginModel, 200);
      expect(result).toEqual({
        accessToken: expect.any(String),
      });
    });

    it('should not login user, bad input model', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

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
      await authTestManager.registration(userRegistrationModel, 204);

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
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      await authTestManager.login(
        { ...uesrLoginModel, password: 'otherPass' },
        401,
      );
    });

    it('should login user, and return access token, refresh token into cookie', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const result = await authTestManager.loginAndCheckCookie(
        uesrLoginModel,
        200,
      );
      expect(result).toEqual({
        accessToken: expect.any(String),
      });
    });
  });

  describe('Logout', () => {
    it('should logout user', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await testSettings.testManager.authTestManager.logOut(
        login.refreshToken,
        204,
      );
    });

    it('should not logout user, refresh token is not correct', async () => {
      await testSettings.testManager.authTestManager.logOut('token', 401);
    });

    it('should not logout user, session not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await testSettings.dataBase.clearDatabase();
      await testSettings.testManager.authTestManager.logOut(
        login.refreshToken,
        401,
      );
    });

    it('should not logout user, session is not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await testSettings.testManager.authTestManager.logOut(
        login.refreshToken,
        204,
      );

      await testSettings.testManager.authTestManager.logOut(
        login.refreshToken,
        401,
      );
    });

    it('should not logout user, session is not correct', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await delay(1000);
      await testSettings.testManager.authTestManager.updateNewPairTokensAndReturnRefreshToken(
        login.refreshToken,
        200,
      );

      await testSettings.testManager.authTestManager.logOut(
        login.refreshToken,
        401,
      );
    });

    it('should not logout user, user not found', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await testSettings.testManager.userTestManager.deleteUser(
        userId,
        adminAuthToken,
        204,
      );

      await delay(1000);

      await testSettings.testManager.authTestManager.logOut(
        login.refreshToken,
        401,
      );
    });
  });

  describe('Refresh token', () => {
    it('should return new tokens pair', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await testSettings.testManager.authTestManager.updateNewPairTokensAndReturnRefreshToken(
        login.refreshToken,
        200,
      );
    });

    it('should not return new tokens pair, refresh token is not correct', async () => {
      await testSettings.testManager.authTestManager.updateNewPairTokens(
        'token',
        401,
      );
    });

    it('should not return new tokens pair, session not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await testSettings.dataBase.clearDatabase();
      await testSettings.testManager.authTestManager.updateNewPairTokens(
        login.refreshToken,
        401,
      );
    });

    it('should not return new tokens pair, session is not correct', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await delay(1000);
      await testSettings.testManager.authTestManager.updateNewPairTokensAndReturnRefreshToken(
        login.refreshToken,
        200,
      );

      await testSettings.testManager.authTestManager.updateNewPairTokens(
        login.refreshToken,
        401,
      );
    });

    it('should not return new tokens pair, session is not found', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      const userRepo =
        testSettings.dataBase.getRepository<AuthSession>(AuthSession);
      await userRepo.update({ userId: userId }, { deviceId: 'did' });

      await testSettings.testManager.authTestManager.updateNewPairTokens(
        login.refreshToken,
        401,
      );
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

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

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
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await authTestManager.registration(userRegistrationModel, 204);

      const userRepo =
        testSettings.dataBase.getRepository<UserConfirmation>(UserConfirmation);
      const getCode = await userRepo.find({});

      await authTestManager.confirmRegistration(
        { code: getCode[0].confirmationCode },
        204,
      );

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
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
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const result = await authTestManager.confirmRegistration(
        { code: 'none' },
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
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await authTestManager.registration(userRegistrationModel, 204);

      const newDateExpire = new Date().toDateString();

      const userConfirmationRepo =
        testSettings.dataBase.getRepository<UserConfirmation>(UserConfirmation);
      await userConfirmationRepo.update(
        {},
        { dataExpire: newDateExpire, confirmationCode: 'code' },
      );

      const result = await authTestManager.confirmRegistration(
        { code: 'code' },
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
      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should resend confirmation code', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      await authTestManager.registration(userRegistrationModel, 204);
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

      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

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
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      await authTestManager.recoveryPassword(userPasswordRecoveryModel, 204);

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not send recovery password email, bad input model', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

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
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      await authTestManager.recoveryPassword(userPasswordRecoveryModel, 204);

      const recoveryPasswordSessionRepo =
        testSettings.dataBase.getRepository<RecoveryPasswordSession>(
          RecoveryPasswordSession,
        );
      await recoveryPasswordSessionRepo.update(
        {},
        { code: passwordChangeModel.recoveryCode },
      );

      await authTestManager.login(uesrLoginModel, 200);

      await authTestManager.changePassword(passwordChangeModel, 204);

      await authTestManager.login(uesrLoginModel, 401);

      await authTestManager.login(
        { ...uesrLoginModel, password: passwordChangeModel.newPassword },
        200,
      );

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not change user`s password, bad input model', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
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
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

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
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      await authTestManager.recoveryPassword(userPasswordRecoveryModel, 204);
      const newExpAt = new Date().toDateString();

      const recoveryPasswordSessionRepo =
        testSettings.dataBase.getRepository<RecoveryPasswordSession>(
          RecoveryPasswordSession,
        );
      await recoveryPasswordSessionRepo.update(
        {},
        { code: passwordChangeModel.recoveryCode, expAt: newExpAt },
      );

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

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });

    it('should not change user`s password, user not found', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      await authTestManager.recoveryPassword(userPasswordRecoveryModel, 204);

      const recoveryPasswordSessionRepo =
        testSettings.dataBase.getRepository<RecoveryPasswordSession>(
          RecoveryPasswordSession,
        );
      await recoveryPasswordSessionRepo.update(
        {},
        { code: passwordChangeModel.recoveryCode },
      );

      const userRepo = testSettings.dataBase.getRepository<User>(User);
      await userRepo.update({}, { isActive: false });

      await authTestManager.changePassword(passwordChangeModel, 400);
      await authTestManager.login(uesrLoginModel, 401);
      await authTestManager.login(
        { ...uesrLoginModel, password: passwordChangeModel.newPassword },
        401,
      );

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockRestore();
    });
  });
});
