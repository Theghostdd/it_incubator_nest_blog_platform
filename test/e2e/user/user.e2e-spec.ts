import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import { IUserCreateTestModel } from '../../models/user/interfaces';
import { BasePagination } from '../../../src/base/pagination/base-pagination';
import { APIErrorsMessageType } from '../../../src/base/types/types';
import { UserTestManager } from '../../utils/request-test-manager/user-test-manager';
import { APISettings } from '../../../src/settings/api-settings';
import {
  UserBanInputModel,
  UserSortingQuery,
} from '../../../src/features/users/user/api/models/input/user-input.model';
import { UserOutputModel } from '../../../src/features/users/user/api/models/output/user-output.model';
import { UserBanStatusEnum } from '../../../src/features/users/user/domain/types';

describe('User e2e', () => {
  let testSettings: ITestSettings;
  let userTestManager: UserTestManager;
  let userCreateModel: IUserCreateTestModel;
  let apiSettings: APISettings;
  let login: string;
  let password: string;
  let adminAuthToken: string;
  let banUserModel: UserBanInputModel;

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
    // await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    userTestManager = testSettings.testManager.userTestManager;
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
    banUserModel = testSettings.testModels.userTestModel.getUserBanModel();
  });

  describe('Get users', () => {
    it('should get users without query', async () => {
      for (let i = 0; i < 11; i++) {
        await userTestManager.createUser(
          {
            ...userCreateModel,
            login: userCreateModel.login + i,
            email: 'some' + i + `@mail.ru`,
          },
          adminAuthToken,
          201,
        );
      }

      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(result).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get users with pagination, page size: 11', async () => {
      for (let i = 0; i < 11; i++) {
        await userTestManager.createUser(
          {
            ...userCreateModel,
            login: userCreateModel.login + i,
            email: 'some' + i + `@mail.ru`,
          },
          adminAuthToken,
          201,
        );
      }
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
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get users with pagination, page number: 2', async () => {
      for (let i = 0; i < 11; i++) {
        await userTestManager.createUser(
          {
            ...userCreateModel,
            login: userCreateModel.login + i,
            email: 'some' + i + `@mail.ru`,
          },
          adminAuthToken,
          201,
        );
      }

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
        totalCount: 11,
        items: expect.any(Array),
      });
    });

    it('should get users with pagination, search login term, and email term', async () => {
      const createdUser: IUserCreateTestModel[] = [];
      for (let i = 0; i < 11; i++) {
        const createUser = {
          ...userCreateModel,
          login: i === 0 ? 'login' : userCreateModel.login + i,
          email: i === 0 ? 'myemail@yandex.com' : 'some' + i + `@mail.ru`,
        };
        await userTestManager.createUser(createUser, adminAuthToken, 201);
        createdUser.push(createUser);
      }
      const result: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          {
            searchLoginTerm: createdUser[0].login.slice(0, 3),
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
            login: createdUser[0].login,
            email: createdUser[0].email,
            createdAt: expect.any(String),
            banInfo: {
              isBanned: false,
              banDate: null,
              banReason: null,
            },
          },
        ],
      });

      const result2: BasePagination<UserOutputModel[] | []> =
        await testSettings.testManager.userTestManager.getUsers(
          {
            searchEmailTerm: createdUser[0].email.slice(0, 5),
          } as UserSortingQuery,
          adminAuthToken,
          200,
        );

      expect(result2).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: createdUser[0].login,
            email: createdUser[0].email,
            createdAt: expect.any(String),
            banInfo: {
              isBanned: false,
              banDate: null,
              banReason: null,
            },
          },
        ],
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

    it('should not get users array, token is not correct', async () => {
      await userTestManager.getUsers({}, 'token', 401);
    });

    it('should get all banned then unbanned then all users', async () => {
      for (let i = 0; i < 11; i++) {
        const { id: userId } = await userTestManager.createUser(
          {
            ...userCreateModel,
            login: userCreateModel.login + i,
            email: 'some' + i + `@mail.ru`,
          },
          adminAuthToken,
          201,
        );

        await userTestManager.banUnBanUser(
          userId,
          banUserModel,
          adminAuthToken,
          204,
        );
      }

      const resultBanned: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          { banStatus: UserBanStatusEnum.banned },
          adminAuthToken,
          200,
        );

      expect(resultBanned).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });

      const resultNotBanned: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          { banStatus: UserBanStatusEnum.notBanned },
          adminAuthToken,
          200,
        );

      expect(resultNotBanned).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });

      const resultAll: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers(
          { banStatus: UserBanStatusEnum.all },
          adminAuthToken,
          200,
        );

      expect(resultAll).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });

      const resultDefault: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(resultDefault).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 11,
        items: expect.any(Array),
      });
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
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });
    });

    it('should not create user, login, and, email not uniq', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

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
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      await userTestManager.deleteUser(userId.toString(), adminAuthToken, 204);
    });

    it('should not delete user by id, user not found', async () => {
      await userTestManager.deleteUser('111', adminAuthToken, 404);
    });

    it('should not delete user by id, token is not correct', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      await userTestManager.deleteUser(userId.toString(), 'token', 401);
    });
  });

  describe('Ban/unBan user', () => {
    it('should create user then ban this user', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const resultBeforeBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(resultBeforeBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      await userTestManager.banUnBanUser(
        userId,
        banUserModel,
        adminAuthToken,
        204,
      );

      const resultAfterBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);
      expect(resultAfterBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: true,
          banDate: expect.any(String),
          banReason: banUserModel.banReason,
        },
      });
    });

    it('should create user then ban this user and after ban unban user', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const resultBeforeBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(resultBeforeBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      await userTestManager.banUnBanUser(
        userId,
        banUserModel,
        adminAuthToken,
        204,
      );

      const resultAfterBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);
      expect(resultAfterBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: true,
          banDate: expect.any(String),
          banReason: banUserModel.banReason,
        },
      });

      await userTestManager.banUnBanUser(
        userId,
        { ...banUserModel, isBanned: false },
        adminAuthToken,
        204,
      );

      const resultAfterUnBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);
      expect(resultAfterUnBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });
    });

    it('should create user then should not ban this user, unauthorized', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const resultBeforeBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(resultBeforeBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      await userTestManager.banUnBanUser(
        userId,
        banUserModel,
        'adminAuthToken',
        401,
      );

      const resultAfterBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);
      expect(resultAfterBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });
    });

    it('should create user then should not ban this user, bad input data', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const resultBeforeBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(resultBeforeBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      const allIncorrect = await userTestManager.banUnBanUser(
        userId,
        { ...banUserModel, isBanned: null, banReason: null },
        adminAuthToken,
        400,
      );

      expect(allIncorrect).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'isBanned' },
          { message: expect.any(String), field: 'banReason' },
        ],
      });

      const isBannedIncorrect = await userTestManager.banUnBanUser(
        userId,
        { ...banUserModel, isBanned: null },
        adminAuthToken,
        400,
      );

      expect(isBannedIncorrect).toEqual({
        errorsMessages: [{ message: expect.any(String), field: 'isBanned' }],
      });

      const reasonIncorrect = await userTestManager.banUnBanUser(
        userId,
        { ...banUserModel, banReason: 'small' },
        adminAuthToken,
        400,
      );

      expect(reasonIncorrect).toEqual({
        errorsMessages: [{ message: expect.any(String), field: 'banReason' }],
      });

      const resultAfterBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);
      expect(resultAfterBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });
    });

    it('should create user then should not ban this user, user not found', async () => {
      const { id: userId } = await userTestManager.createUser(
        userCreateModel,
        adminAuthToken,
        201,
      );

      const resultBeforeBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);

      expect(resultBeforeBan.items[0]).toEqual({
        id: userId,
        login: userCreateModel.login,
        email: userCreateModel.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      await userTestManager.deleteUser(userId, adminAuthToken, 204);

      await userTestManager.banUnBanUser(
        userId,
        banUserModel,
        adminAuthToken,
        404,
      );

      const resultAfterBan: BasePagination<UserOutputModel[] | []> =
        await userTestManager.getUsers({}, adminAuthToken, 200);
      expect(resultAfterBan.items).toHaveLength(0);
    });
  });
});
