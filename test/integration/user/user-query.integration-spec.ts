import { UserQueryRepositories } from '../../../src/features/user/infrastructure/user-query-repositories';
import { initSettings } from '../../settings/test-settings';
import { ITestSettings } from '../../settings/interfaces';
import { IUserInsertTestModel } from '../../models/user/interfaces';
import {
  UserMeOutputModel,
  UserOutputModel,
} from '../../../src/features/user/api/models/output/user-output.model';
import { NotFoundException } from '@nestjs/common';
import { BasePagination } from '../../../src/base/pagination/base-pagination';
import { UserSortingQuery } from '../../../src/features/user/api/models/input/user-input.model';

describe('User - query', () => {
  let userQueryRepositories: UserQueryRepositories;
  let testSettings: ITestSettings;
  let userInsertModel: IUserInsertTestModel;
  let userInsertManyModel: IUserInsertTestModel[];

  beforeAll(async () => {
    testSettings = await initSettings();
    userQueryRepositories =
      testSettings.testingAppModule.get<UserQueryRepositories>(
        UserQueryRepositories,
      );
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  beforeEach(async () => {
    await testSettings.dataBase.clearDatabase();
    userInsertModel =
      testSettings.testModels.userTestModel.getUserInsertModel();
    userInsertManyModel =
      testSettings.testModels.userTestModel.getUserInsertManyModel();
  });

  describe('Get user', () => {
    it('should get user by id', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );
      const result: UserOutputModel = await userQueryRepositories.getUserById(
        userId.toString(),
      );
      expect(result).toEqual({
        id: userId.toString(),
        login: userInsertModel.login,
        email: userInsertModel.email,
        createdAt: expect.any(String),
      });
    });

    it('should not get user, user not found', async () => {
      await expect(
        userQueryRepositories.getUserById('66c4e15b0520745731561266'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should get user by id for current user', async () => {
      const { insertedId: userId } = await testSettings.dataBase.dbInsertOne(
        'users',
        userInsertModel,
      );
      const result: UserMeOutputModel =
        await userQueryRepositories.getUserByIdAuthMe(userId.toString());
      expect(result).toEqual({
        login: userInsertModel.login,
        email: userInsertModel.email,
        userId: userId.toString(),
      });
    });

    it('should not get user for current user, user not found', async () => {
      await expect(
        userQueryRepositories.getUserByIdAuthMe('66c4e15b0520745731561266'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Get users', () => {
    it('should get users without query', async () => {
      await testSettings.dataBase.dbInsertMany('users', userInsertManyModel);

      const result: BasePagination<UserOutputModel[] | []> =
        await userQueryRepositories.getUsers();

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
        await userQueryRepositories.getUsers({
          pageSize: 11,
        } as UserSortingQuery);

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
        await userQueryRepositories.getUsers({
          pageNumber: 2,
        } as UserSortingQuery);

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
        await userQueryRepositories.getUsers({
          searchLoginTerm: userInsertManyModel[10].login.slice(0, 3),
        } as UserSortingQuery);

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
        await userQueryRepositories.getUsers({
          searchLoginTerm: userInsertManyModel[0].email.slice(0, 5),
        } as UserSortingQuery);

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
        await userQueryRepositories.getUsers();

      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: expect.any(Array),
      });

      expect(result.items).toHaveLength(0);
    });
  });
});
