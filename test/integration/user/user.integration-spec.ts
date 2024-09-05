import { UserService } from '../../../src/features/users/user/application/user-service';
import { AppResult } from '../../../src/base/enum/app-result.enum';
import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import {
  IUserCreateTestModel,
  IUserInsertTestModel,
} from '../../models/user/interfaces';
import {
  APIErrorsMessageType,
  AppResultType,
} from '../../../src/base/types/types';
import { UserDocumentType } from '../../../src/features/users/user/domain/user.entity';
import { Types } from 'mongoose';

describe('User', () => {
  let userService: UserService;
  let testSettings: ITestSettings;
  let userModel: IUserCreateTestModel;
  let userInsertModel: IUserInsertTestModel;

  beforeAll(async () => {
    testSettings = await initSettings();
    userService = testSettings.testingAppModule.get<UserService>(UserService);
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    userModel = testSettings.testModels.userTestModel.getUserCreateModel();
    userInsertModel =
      testSettings.testModels.userTestModel.getUserInsertModel();
  });

  describe('Create user', () => {
    it('should create user', async () => {
      const result: AppResultType<string, APIErrorsMessageType> =
        await userService.createUser(userModel);
      expect(result).toEqual({
        appResult: AppResult.Success,
        data: expect.any(String),
      });

      const user = await testSettings.dataBase.dbFindOne('users', {
        _id: new Types.ObjectId(result.data),
      });
      expect(user).toEqual({
        _id: expect.any(Types.ObjectId),
        createdAt: expect.any(String),
        login: userModel.login,
        email: userModel.email,
        password: expect.any(String),
        userConfirm: {
          isConfirm: true,
          confirmationCode: expect.any(String),
          dataExpire: expect.any(String),
        },
        __v: expect.any(Number),
      });
    });

    it('should not create user, login, and, email not uniq', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      const result: AppResultType<string, APIErrorsMessageType> =
        await userService.createUser(userModel);
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

      const withLogin: AppResultType<string, APIErrorsMessageType> =
        await userService.createUser({
          ...userModel,
          email: 'somenew@mail.ru',
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

      const withEmail: AppResultType<string, APIErrorsMessageType> =
        await userService.createUser({
          ...userModel,
          login: 'someNew',
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

      const users = await testSettings.dataBase.dbFindAll('users');
      expect(users).toHaveLength(1);
    });
  });

  describe('Delete user', () => {
    it('should delete user by id', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      const result: AppResultType = await userService.deleteUser(
        userId.toString(),
      );

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });

      const users = await testSettings.dataBase.dbFindAll('users');
      expect(users).toHaveLength(0);
    });

    it('should not delete user by id, user not found', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      const result: AppResultType = await userService.deleteUser(
        '66bf39c8f855a5438d02adbf',
      );

      expect(result).toEqual({
        appResult: AppResult.NotFound,
        data: null,
      });

      const users = await testSettings.dataBase.dbFindAll('users');
      expect(users).toHaveLength(1);
    });
  });

  describe('Check uniq login and email', () => {
    it('should be success, login and email are uniq', async () => {
      const result: AppResultType<UserDocumentType, APIErrorsMessageType> =
        await userService.checkUniqLoginAndEmail(
          userModel.email,
          userModel.login,
        );

      expect(result).toEqual({
        appResult: AppResult.Success,
        data: null,
      });
    });

    it('should return user document and not uniq field, login and email are not uniq', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);
      const result: AppResultType<UserDocumentType, APIErrorsMessageType> =
        await userService.checkUniqLoginAndEmail(
          userModel.email,
          userModel.login,
        );

      expect(result).toEqual({
        appResult: AppResult.BadRequest,
        data: expect.any(Object),
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

      const withLogin: AppResultType<UserDocumentType, APIErrorsMessageType> =
        await userService.checkUniqLoginAndEmail(
          'other@mail.ru',
          userModel.login,
        );

      expect(withLogin).toEqual({
        appResult: AppResult.BadRequest,
        data: expect.any(Object),
        errorField: {
          errorsMessages: [
            {
              field: 'login',
              message: expect.any(String),
            },
          ],
        },
      });

      const withEmail: AppResultType<UserDocumentType, APIErrorsMessageType> =
        await userService.checkUniqLoginAndEmail(userModel.email, 'otherLogin');

      expect(withEmail).toEqual({
        appResult: AppResult.BadRequest,
        data: expect.any(Object),
        errorField: {
          errorsMessages: [
            {
              field: 'email',
              message: expect.any(String),
            },
          ],
        },
      });
    });
  });
});
