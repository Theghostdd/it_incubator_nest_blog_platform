import { ITestSettings } from '../../settings/interfaces';
import {
  IUserCreateTestModel,
  IUserLoginTestModel,
} from '../../models/user/interfaces';
import { initSettings } from '../../settings/test-settings';
import { delay } from '../../utils/delay/delay';
import { UserTestManager } from '../../utils/request-test-manager/user-test-manager';
import { APISettings } from '../../../src/settings/api-settings';
import { AuthService } from '../../../src/features/access-control/auth/application/auth-application';
import { tablesName } from '../../../src/core/utils/tables/tables';

describe('Security devices e2e', () => {
  let testSettings: ITestSettings;
  let uesrLoginModel: IUserLoginTestModel;
  let userTestManager: UserTestManager;
  let userCreateModel: IUserCreateTestModel;
  let apiSettings: APISettings;
  let login: string;
  let password: string;
  let adminAuthToken: string;
  let authService: AuthService;

  beforeAll(async () => {
    testSettings = await initSettings();
    apiSettings = testSettings.configService.get('apiSettings', {
      infer: true,
    });
    authService = testSettings.app.get(AuthService);
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
    testSettings.testModels.userTestModel.getUserChangePasswordModel();
    uesrLoginModel = testSettings.testModels.userTestModel.getUserLoginModel();
    userTestManager = testSettings.testManager.userTestManager;
    userCreateModel =
      testSettings.testModels.userTestModel.getUserCreateModel();
  });

  describe('Get all security devices', () => {
    it('should get all security devices', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await delay(1000);

      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );
      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );

      const result =
        await testSettings.testManager.securityDevicesTestManager.getAllDevices(
          login.refreshToken,
          200,
        );
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        ip: expect.any(String),
        title: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      });
    });
    it('should not get all security devices, bad refresh token', async () => {
      await testSettings.testManager.securityDevicesTestManager.getAllDevices(
        'refreshToken',
        401,
      );
    });
  });

  describe('Delete device by deviceId', () => {
    it('should delete device by device id', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await delay(1000);

      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );
      const spy = jest
        .spyOn(authService, 'generateDeviceId')
        .mockReturnValue('12345');

      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );

      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        login.refreshToken,
        '12345',
        204,
      );

      const getDevices =
        await testSettings.testManager.securityDevicesTestManager.getAllDevices(
          login.refreshToken,
          200,
        );
      expect(getDevices).toHaveLength(2);
      spy.mockRestore();
    });

    it('should not delete device by device id, session not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await delay(1000);

      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );
      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );

      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        login.refreshToken,
        '12345',
        404,
      );

      const getDevices =
        await testSettings.testManager.securityDevicesTestManager.getAllDevices(
          login.refreshToken,
          200,
        );
      expect(getDevices).toHaveLength(3);
    });

    it('should not delete device by device id, user id is not correct', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      await userTestManager.createUser(
        { ...userCreateModel, email: 'email2@mail.ru', login: 'login2' },
        adminAuthToken,
        201,
      );

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await delay(1000);

      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );
      const spy = jest
        .spyOn(authService, 'generateDeviceId')
        .mockReturnValue('12345');
      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );
      spy.mockRestore();
      await testSettings.dataBase.queryDataSource(
        `UPDATE ${tablesName.AUTH_SESSIONS} SET "userId" = '2' WHERE "deviceId" = '12345'`,
      );

      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        login.refreshToken,
        '12345',
        403,
      );

      const getDevices =
        await testSettings.testManager.securityDevicesTestManager.getAllDevices(
          login.refreshToken,
          200,
        );
      expect(getDevices).toHaveLength(2);
    });

    it('should not delete device by device id, bad refresh token', async () => {
      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        'refreshToken',
        '12345',
        401,
      );
    });

    it('should not delete device by device id, session not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await testSettings.dataBase.clearDatabase();
      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        login.refreshToken,
        '12345',
        401,
      );
    });

    it('should not delete device by device id, session is not correct', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await testSettings.dataBase.queryDataSource(
        `UPDATE ${tablesName.AUTH_SESSIONS} SET "issueAt"='2023-09-05T12:34:56Z'`,
      );

      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        login.refreshToken,
        '12345',
        401,
      );
    });

    it('should not delete device by device id, user not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await testSettings.dataBase.queryDataSource(
        `UPDATE ${tablesName.USERS} SET "isActive" = false`,
      );
      await testSettings.dataBase.queryDataSource(
        `UPDATE ${tablesName.AUTH_SESSIONS} SET "deviceId" = '12345'`,
      );
      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        login.refreshToken,
        '12345',
        401,
      );
    });

    it('should not delete device by device id, session was update', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await delay(1000);
      await testSettings.testManager.authTestManager.updateNewPairTokens(
        login.refreshToken,
        200,
      );

      await testSettings.testManager.securityDevicesTestManager.deleteDeviceByDeviceId(
        login.refreshToken,
        '12345',
        401,
      );
    });
  });

  describe('Delete all devices exclude current', () => {
    it('should delete all devices exclude current', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);
      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await delay(1000);

      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );
      await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
        uesrLoginModel,
        200,
      );
      await testSettings.testManager.securityDevicesTestManager.deleteAllDevicesExcludeCurrent(
        login.refreshToken,
        204,
      );

      const getDevices =
        await testSettings.testManager.securityDevicesTestManager.getAllDevices(
          login.refreshToken,
          200,
        );
      expect(getDevices).toHaveLength(1);
    });

    it('should not delete all devices exclude current, bad refresh token', async () => {
      await testSettings.testManager.securityDevicesTestManager.deleteAllDevicesExcludeCurrent(
        'refreshToken',
        401,
      );
    });

    it('should not delete all devices exclude current, session is not correct', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );
      await delay(1000);
      await testSettings.testManager.authTestManager.updateNewPairTokens(
        login.refreshToken,
        200,
      );
      await testSettings.testManager.securityDevicesTestManager.deleteAllDevicesExcludeCurrent(
        login.refreshToken,
        401,
      );
    });

    it('should not delete all devices exclude current, user not found', async () => {
      await userTestManager.createUser(userCreateModel, adminAuthToken, 201);

      const login =
        await testSettings.testManager.authTestManager.loginAndReturnRefreshToken(
          uesrLoginModel,
          200,
        );

      await testSettings.dataBase.queryDataSource(
        `UPDATE ${tablesName.USERS} SET "isActive" = false`,
      );
      await testSettings.testManager.securityDevicesTestManager.deleteAllDevicesExcludeCurrent(
        login.refreshToken,
        401,
      );
    });
  });
});
