import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import {
  IUserCreateTestModel,
  IUserInsertTestModel,
} from '../../models/user/interfaces';
import { UserOutputModel } from '../../../src/features/users/user/api/models/output/user-output.model';
import { BasePagination } from '../../../src/base/pagination/base-pagination';
import { UserSortingQuery } from '../../../src/features/users/user/api/models/input/user-input.model';
import { APIErrorsMessageType } from '../../../src/base/types/types';
import { UserTestManager } from '../../utils/request-test-manager/user-test-manager';
import { APISettings } from '../../../src/settings/api-settings';

describe('User e2e', () => {
  let testSettings: ITestSettings;
  let userInsertManyModel: IUserInsertTestModel[];
  let userTestManager: UserTestManager;
  let userCreateModel: IUserCreateTestModel;
  let userInsertModel: IUserInsertTestModel;
  let apiSettings: APISettings;
  let login: string;
  let password: string;
  let adminAuthToken: string;

  beforeAll(async () => {
    testSettings = await initSettings();
    apiSettings = testSettings.configService.get('apiSettings', {
      infer: true,
    });

    login = apiSettings.SUPER_ADMIN_AUTH.login;
    password = apiSettings.SUPER_ADMIN_AUTH.password;
    adminAuthToken = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    userTestManager = testSettings.testManager.userTestManager;
    userInsertManyModel =
      testSettings.testModels.userTestModel.getUserInsertManyModel();
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
    userInsertModel =
      testSettings.testModels.userTestModel.getUserInsertModel();
  });

  describe('Get users', () => {
    it('should get users without query', async () => {
      await testSettings.dataBase.dbInsertMany('users', userInsertManyModel);

      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: userInsertManyModel.length,
        items: expect.any(Array),
      });
    });

    it('should get users with pagination, page size: 11', async () => {
      await testSettings.dataBase.dbInsertMany('users', userInsertManyModel);

      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          {
            pageSize: 11,
          } as UserSortingQuery,
          adminAuthToken,
          200,
        );

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 11,
        totalCount: userInsertManyModel.length,
        items: expect.any(Array),
      });
    });

    it('should get users with pagination, page number: 2', async () => {
      await testSettings.dataBase.dbInsertMany('users', userInsertManyModel);

      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          {
            pageNumber: 2,
          } as UserSortingQuery,
          adminAuthToken,
          200,
        );

      expect(result).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 10,
        totalCount: userInsertManyModel.length,
        items: expect.any(Array),
      });
    });

    it('should get users with pagination, search login term, and email term', async () => {
      await testSettings.dataBase.dbInsertMany('users', userInsertManyModel);

      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          {
            searchLoginTerm: userInsertManyModel[10].login.slice(0, 3),
          } as UserSortingQuery,
          adminAuthToken,
          200,
        );

      expect(result).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: userInsertManyModel[10].login,
            email: userInsertManyModel[10].email,
            createdAt: expect.any(String),
          },
        ],
      });

      const result2: BasePagination<UserOutputModel[] | []> =
        await testSettings.testManager.userTestManager.getUsers(
          {
            searchLoginTerm: userInsertManyModel[0].email.slice(0, 5),
          } as UserSortingQuery,
          adminAuthToken,
          200,
        );

      expect(result2).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 10,
        items: expect.any(Array),
      });
    });

    it('should get empty users array', async () => {
      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: expect.any(Array),
      });

      expect(result.items).toHaveLength(0);
    });

    it('should get users with sorting by login, asc', async () => {
      await testSettings.dataBase.dbInsertMany('users', userInsertManyModel);

      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          {
            sortBy: 'login',
            sortDirection: 'asc',
            pageSize: 20,
          } as UserSortingQuery,
          adminAuthToken,
          200,
        );

      const mapResult = result.items.map((item) => {
        return {
          login: item.login,
          email: item.email,
        };
      });

      const mapInsertModelAndSortByAsc = userInsertManyModel
        .map((item) => {
          return {
            login: item.login,
            email: item.email,
          };
        })
        .sort((a, b) => a.login.localeCompare(b.login));

      expect(mapResult).toEqual(mapInsertModelAndSortByAsc);
    });

    it('should not get users array, token is not correct', async () => {
      await userTestManager.getUsers({}, 'token', 401);
    });
  });

  describe('Create user', () => {
    it('should create user', async () => {
      const result: UserOutputModel = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );
      expect(result).toEqual({
        id: expect.any(String),
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
      });
    });

    it('should not create user, login, and, email not uniq', async () => {
      await testSettings.dataBase.dbInsertOne('users', userInsertModel);

      const result: APIErrorsMessageType = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        400,
      );
      expect(result).toEqual({
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
      });

      const withLogin: APIErrorsMessageType = await userTestManager.createUser(
        {
          ...userCreateModel,
          email: 'somenew@mail.ru',
        },
        adminAuthToken,
        400,
      );
      expect(withLogin).toEqual({
        errorsMessages: [
          {
            field: 'login',
            message: expect.any(String),
          },
        ],
      });

      const withEmail: APIErrorsMessageType = await userTestManager.createUser(
        {
          ...userCreateModel,
          login: 'someNew',
        },
        adminAuthToken,
        400,
      );
      expect(withEmail).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: expect.any(String),
          },
        ],
      });
    });

    it('should not create user, bad input data', async () => {
      const result: APIErrorsMessageType = await userTestManager.createUser(
        { login: '', email: '', password: '' },
        adminAuthToken,
        400,
      );
      expect(result).toEqual({
        errorsMessages: [
          {
            field: 'login',
            message: expect.any(String),
          },
          {
            field: 'password',
            message: expect.any(String),
          },
          {
            field: 'email',
            message: expect.any(String),
          },
        ],
      });

      const withLogin: APIErrorsMessageType = await userTestManager.createUser(
        { login: '', email: 'somemail@mail.ru', password: 'thisihmypass' },
        adminAuthToken,
        400,
      );
      expect(withLogin).toEqual({
        errorsMessages: [
          {
            field: 'login',
            message: expect.any(String),
          },
        ],
      });

      const withEmail: APIErrorsMessageType = await userTestManager.createUser(
        {
          login: 'login',
          email: 'somemail',
          password: 'thisihmypass',
        },
        adminAuthToken,
        400,
      );
      expect(withEmail).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: expect.any(String),
          },
        ],
      });

      const withPassword: APIErrorsMessageType =
        await userTestManager.createUser(
          {
            login: 'myLogin',
            email: 'somemail@mail.ru',
            password: 'th',
          },
          adminAuthToken,
          400,
        );
      expect(withPassword).toEqual({
        errorsMessages: [
          {
            field: 'password',
            message: expect.any(String),
          },
        ],
      });
    });

    it('should not create user, token is not valid', async () => {
      await userTestManager.createUser(userCreateModel, 'token', 401);
    });
  });

  describe('Delete user', () => {
    it('should delete user by id', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      await userTestManager.deleteUser(userId.toString(), adminAuthToken, 204);
    });

    it('should not delete user by id, user not found', async () => {
      await userTestManager.deleteUser(
        '66bf39c8f855a5438d02adbf',
        adminAuthToken,
        404,
      );
    });

    it('should not delete user by id, token is not correct', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );

      await userTestManager.deleteUser(userId.toString(), 'token', 401);
    });
  });
});
