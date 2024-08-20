import { AuthService } from '../../../src/features/auth/application/auth-application';
import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import {
  IUserChangePasswordTestModel,
  IUserConfirmationEmailTestModel,
  IUserInsertTestModel,
  IUserLoginTestModel,
  IUserPasswordRecoveryTestModel,
  IUserRegistrationTestModel,
  IUserResendConfirmationCodeEmailTestModel,
} from '../../models/user/interfaces';
import {
  APIErrorMessageType,
  APIErrorsMessageType,
  AppResultType,
  AuthorizationUserResponseType,
} from '../../../src/base/types/types';
import { AppResult } from '../../../src/base/enum/app-result.enum';
import { NodeMailerMockService } from '../../mock/nodemailer-mock';
import { NodeMailerService } from '../../../src/features/nodemailer/application/nodemailer-application';
import { Types } from 'mongoose';
import { addMinutes, subDays } from 'date-fns';
import { IAuthRecoveryPasswordSessionInsertModel } from '../../models/auth/interfaces';

describe('Auth', () => {
  let authService: AuthService;
  let testSettings: ITestSettings;
  let nodemailerMockService: NodeMailerMockService;
  let userLoginModel: IUserLoginTestModel;
  let userInsertModel: IUserInsertTestModel;
  let userChnagePasswordModel: IUserChangePasswordTestModel;
  let userRegistrationModel: IUserRegistrationTestModel;
  let userConfirmationEmailCodeModel: IUserConfirmationEmailTestModel;
  let userResendConfirmationCodeEmailModel: IUserResendConfirmationCodeEmailTestModel;
  let userPasswordRecoveryModel: IUserPasswordRecoveryTestModel;
  let authRecoveryPasswordSessionModel: IAuthRecoveryPasswordSessionInsertModel;

  beforeAll(async () => {
    testSettings = await initSettings();
    authService = testSettings.testingAppModule.get<AuthService>(AuthService);
    nodemailerMockService =
      testSettings.testingAppModule.get<NodeMailerService>(NodeMailerService);
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    userLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
    userInsertModel =
      testSettings.testModels.userTestModel.getUserInsertModel();
    userChnagePasswordModel =
      testSettings.testModels.userTestModel.getUserChangePasswordModel();
    userRegistrationModel =
      testSettings.testModels.userTestModel.getUserRegistrationModel();
    userConfirmationEmailCodeModel =
      testSettings.testModels.userTestModel.getUserConfirmationEmailModel();
    userResendConfirmationCodeEmailModel =
      testSettings.testModels.userTestModel.getUserResendConfirmationCodeEmailModel();
    userPasswordRecoveryModel =
      testSettings.testModels.userTestModel.getUserPasswordRecoveryModel();
    authRecoveryPasswordSessionModel =
      testSettings.testModels.authTestModel.getRecoveryPasswordSessionInsertModel();
  });

  describe('Login user', () => {
    it('should login user', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      const result: AppResultType<
        Omit<AuthorizationUserResponseType, 'refreshToken'>,
        APIErrorMessageType
      > = await authService.login(userLoginModel);

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: {
          accessToken: expect.any(String),
        },
      });
    });

    it('should not login user, user not found', async () => {
      const result: AppResultType<
        Omit<AuthorizationUserResponseType, 'refreshToken'>,
        APIErrorMessageType
      > = await authService.login(userLoginModel);

      expect(result).toEqual({
        appResult: AppResult.Unauthorized,
        data: null,
      });
    });

    it('should not login user, user`s password is not correct', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      const result: AppResultType<
        Omit<AuthorizationUserResponseType, 'refreshToken'>,
        APIErrorMessageType
      > = await authService.login({ ...userLoginModel, password: 'otherPass' });

      expect(result).toEqual({
        appResult: AppResult.Unauthorized,
        data: null,
      });
    });

    it('should not login user, user is not confirmed', async () => {
      await testSettings.dataBase.dbInsertOne('users', {
        ...userInsertModel,
        userConfirm: { ...userInsertModel.userConfirm, isConfirm: false },
      });
      const result: AppResultType<
        Omit<AuthorizationUserResponseType, 'refreshToken'>,
        APIErrorMessageType
      > = await authService.login(userLoginModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: { message: expect.any(String), field: 'code' },
      });
    });
  });

  describe('Registration user', () => {
    it('should registration user', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      const result: AppResultType<null, APIErrorsMessageType> =
        await authService.registration(userRegistrationModel);

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockReset();

      const users = await testSettings.dataBase.dbFindAll('users');
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual({
        _id: expect.any(Types.ObjectId),
        createdAt: expect.any(String),
        login: userRegistrationModel.login,
        email: userRegistrationModel.email,
        password: expect.any(String),
        userConfirm: {
          isConfirm: false,
          confirmationCode: expect.any(String),
          dataExpire: expect.any(String),
        },
        __v: expect.any(Number),
      });
    });

    it('should not registration, login and email are not uniq', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result: AppResultType<null, APIErrorsMessageType> =
        await authService.registration(userRegistrationModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: {
          errorsMessages: [
            {
              field: 'login',
              message: expect.any(String),
            },
            {
              field: 'email',
              message: expect.any(String),
            },
          ],
        },
      });

      const withEmail: AppResultType<null, APIErrorsMessageType> =
        await authService.registration({
          ...userRegistrationModel,
          login: 'otherLogin',
        });

      expect(withEmail).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: {
          errorsMessages: [
            {
              field: 'email',
              message: expect.any(String),
            },
          ],
        },
      });

      const withLogin: AppResultType<null, APIErrorsMessageType> =
        await authService.registration({
          ...userRegistrationModel,
          email: 'otheremail@mail.ru',
        });

      expect(withLogin).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: {
          errorsMessages: [
            {
              field: 'login',
              message: expect.any(String),
            },
          ],
        },
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockRestore();

      const users = await testSettings.dataBase.dbFindAll('users');
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual({
        _id: expect.any(Types.ObjectId),
        createdAt: expect.any(String),
        login: userInsertModel.login,
        email: userInsertModel.email,
        password: expect.any(String),
        userConfirm: {
          isConfirm: true,
          confirmationCode: expect.any(String),
          dataExpire: expect.any(String),
        },
        __v: expect.any(Number),
      });
    });

    it('should confirm user after registration', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        {
          ...userInsertModel,
          userConfirm: {
            ...userInsertModel.userConfirm,
            isConfirm: false,
            dataExpire: addMinutes(new Date(), 30).toISOString(),
          },
        },
      );

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.confirmUserByEmail(userConfirmationEmailCodeModel);

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(userId),
      });
      expect(user.userConfirm).toEqual({
        isConfirm: true,
        confirmationCode: expect.any(String),
        dataExpire: expect.any(String),
      });
    });

    it('should not confirm user after registration, user by code not found', async () => {
      const result: AppResultType<null, APIErrorMessageType> =
        await authService.confirmUserByEmail(userConfirmationEmailCodeModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: { message: expect.any(String), field: 'code' },
      });

      const users = await testSettings.dataBase.dbFindAll('users');
      expect(users).toHaveLength(0);
    });

    it('should not confirm user after registration, user has been confirmed', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.confirmUserByEmail(userConfirmationEmailCodeModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: { message: expect.any(String), field: 'code' },
      });
    });

    it('should not confirm user after registration, code has expired', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        {
          ...userInsertModel,
          userConfirm: {
            ...userInsertModel.userConfirm,
            isConfirm: false,
            dataExpire: subDays(new Date(), 5).toISOString(),
          },
        },
      );

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.confirmUserByEmail(userConfirmationEmailCodeModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: {
          message: expect.any(String),
          field: 'code',
        },
      });

      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(userId),
      });
      expect(user.userConfirm).toEqual({
        isConfirm: false,
        confirmationCode: expect.any(String),
        dataExpire: expect.any(String),
      });
    });

    it('should resend confirmation code', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      const userInsertObjectModel = {
        ...userInsertModel,
        userConfirm: {
          ...userInsertModel.userConfirm,
          isConfirm: false,
          dataExpire: subDays(new Date(), 5).toISOString(),
        },
      };
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertObjectModel,
      );

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.resendConfirmCode(
          userResendConfirmationCodeEmailModel,
        );

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(userId),
      });
      expect(user.userConfirm.isConfirm).toBeFalsy();
      expect(user.userConfirm.dataExpire).not.toBe(
        userInsertObjectModel.userConfirm.dataExpire,
      );
      expect(user.userConfirm.confirmationCode).not.toBe(
        userInsertObjectModel.userConfirm.confirmationCode,
      );

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockReset();
    });

    it('should not resend confirmation code, user not found', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.resendConfirmCode(
          userResendConfirmationCodeEmailModel,
        );

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: { message: expect.any(String), field: 'email' },
      });

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockReset();
    });

    it('should not resend confirmation code, user has been confirmed', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.resendConfirmCode(
          userResendConfirmationCodeEmailModel,
        );

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: { message: expect.any(String), field: 'email' },
      });

      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(userId),
      });
      expect(user.userConfirm.isConfirm).toBeTruthy();
      expect(user.userConfirm.dataExpire).toBe(
        userInsertModel.userConfirm.dataExpire,
      );
      expect(user.userConfirm.confirmationCode).toBe(
        userInsertModel.userConfirm.confirmationCode,
      );

      expect(sendMailSpy).not.toHaveBeenCalled();
      sendMailSpy.mockReset();
    });
  });

  describe('Password recovery', () => {
    it('should send email with code to recovery password but did not create session to change password', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');

      const result: AppResultType<null, APIErrorsMessageType> =
        await authService.passwordRecovery(userPasswordRecoveryModel);

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockReset();

      const recoverySession = await testSettings.dataBase.dbFindAll(
        'recoverypasswordsessions',
      );
      expect(recoverySession).toHaveLength(0);
    });

    it('should send email with code to recovery password and created recovery session', async () => {
      const sendMailSpy = jest.spyOn(nodemailerMockService, 'sendMail');
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result: AppResultType<null, APIErrorsMessageType> =
        await authService.passwordRecovery(userPasswordRecoveryModel);

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      expect(sendMailSpy).toHaveBeenCalled();
      sendMailSpy.mockReset();

      const recoverySession = await testSettings.dataBase.dbFindOne(
        'recoverypasswordsessions',
        { email: userInsertModel.email },
      );
      expect(recoverySession).toEqual({
        _id: expect.any(Types.ObjectId),
        email: userInsertModel.email,
        code: expect.any(String),
        expAt: expect.any(String),
        __v: expect.any(Number),
      });
    });
  });

  describe('Change password', () => {
    it('should change password for user', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );
      await testSettings.dataBase.dbInsertOne(
        'recoverypasswordsessions',
        authRecoveryPasswordSessionModel,
      );

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.changeUserPassword(userChnagePasswordModel);

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const recoverySession = await testSettings.dataBase.dbFindAll(
        'recoverypasswordsessions',
      );
      expect(recoverySession).toHaveLength(0);
      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(userId),
      });
      expect(user.password).not.toBe(userInsertModel.password);
    });

    it('should not change password, recovery session not found', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.changeUserPassword(userChnagePasswordModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: { message: expect.any(String), field: 'recoveryCode' },
      });

      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(userId),
      });
      expect(user.password).toBe(userInsertModel.password);
    });

    it('should not change password, recovery session is expired', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );
      await testSettings.dataBase.dbInsertOne('recoverypasswordsessions', {
        ...authRecoveryPasswordSessionModel,
        expAt: subDays(new Date(), 2),
      });

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.changeUserPassword(userChnagePasswordModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: { message: expect.any(String), field: 'recoveryCode' },
      });

      const recoverySession = await testSettings.dataBase.dbFindAll(
        'recoverypasswordsessions',
      );
      expect(recoverySession).toHaveLength(1);
      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(userId),
      });
      expect(user.password).toBe(userInsertModel.password);
    });

    it('should not change password, user not found', async () => {
      await testSettings.dataBase.dbInsertOne(
        'recoverypasswordsessions',
        authRecoveryPasswordSessionModel,
      );

      const result: AppResultType<null, APIErrorMessageType> =
        await authService.changeUserPassword(userChnagePasswordModel);

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: null,
        errorField: null,
      });

      const recoverySession = await testSettings.dataBase.dbFindAll(
        'recoverypasswordsessions',
      );
      expect(recoverySession).toHaveLength(1);
    });
  });
});
