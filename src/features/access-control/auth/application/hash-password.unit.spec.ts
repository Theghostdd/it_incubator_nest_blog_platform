import { initSettings } from '../../../../test/settings/test-settings';
import { AuthService } from './auth-application';
import { ITestSettings } from '../../../../test/settings/interfaces';

describe('Auth unit test', () => {
  let authService: AuthService;
  let testSettings: ITestSettings;

  beforeAll(async () => {
    testSettings = await initSettings();
    authService = testSettings.testingAppModule.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await testSettings.app.close();
    await testSettings.dataBase.dbConnectionClose();
  });

  describe('Generate hash', () => {
    it('should generate password hash', async () => {
      const result: string =
        await authService.generatePasswordHashAndSalt('myPassword');

      expect(result).toEqual(expect.any(String));
    });
  });

  describe('Compare hash', () => {
    it('should compare password and return true', async () => {
      const hash: string =
        await authService.generatePasswordHashAndSalt('myPassword');

      const result: boolean = await authService.comparePasswordHashAndSalt(
        'myPassword',
        hash,
      );

      expect(result).toBeTruthy();
    });

    it('should compare password and return false', async () => {
      const hash: string =
        await authService.generatePasswordHashAndSalt('myPassword');

      const result: boolean = await authService.comparePasswordHashAndSalt(
        'myPassword2',
        hash,
      );

      expect(result).toBeFalsy();
    });
  });
});
