import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import request from 'supertest';
import {
  IUserChangePasswordTestModel,
  IUserConfirmationEmailTestModel,
  IUserLoginTestModel,
  IUserPasswordRecoveryTestModel,
  IUserRegistrationTestModel,
  IUserResendConfirmationCodeEmailTestModel,
} from '../../models/user/interfaces';

export class AuthTestManager {
  private readonly apiPrefix: string;
  private readonly authEndpoint: string;
  private readonly loginEndpoint: string;
  private readonly registrationEndpoint: string;
  private readonly registrationConfirmEndpoint: string;
  private readonly registrationResendConfirmCodeEndpoint: string;
  private readonly passwordRecoveryEndpoint: string;
  private readonly changePasswordEndpoint: string;
  private readonly currentUserEndpoint: string;
  private readonly logoutEndpoint: string;
  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.authEndpoint = `${this.apiPrefix}/${apiPrefixSettings.AUTH.auth}`;
    this.loginEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.login}`;
    this.registrationEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.registration}`;
    this.registrationConfirmEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.registration_confirmation}`;
    this.registrationResendConfirmCodeEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.registration_email_resending}`;
    this.passwordRecoveryEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.password_recovery}`;
    this.changePasswordEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.new_password}`;
    this.currentUserEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.me}`;
    this.logoutEndpoint = `${this.authEndpoint}/${apiPrefixSettings.AUTH.logout}`;
  }
  async registration(
    registrationModel: IUserRegistrationTestModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.registrationEndpoint}`)
      .send(registrationModel)
      .expect(statusCode);
    return result.body;
  }

  async confirmRegistration(
    confirmationModel: IUserConfirmationEmailTestModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.registrationConfirmEndpoint}`)
      .send(confirmationModel)
      .expect(statusCode);
    return result.body;
  }

  async resendConfirmationCode(
    resendConfirmationCodeModel: IUserResendConfirmationCodeEmailTestModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.registrationResendConfirmCodeEndpoint}`)
      .send(resendConfirmationCodeModel)
      .expect(statusCode);
    return result.body;
  }

  async recoveryPassword(
    recoveryPasswordModel: IUserPasswordRecoveryTestModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.passwordRecoveryEndpoint}`)
      .send(recoveryPasswordModel)
      .expect(statusCode);
    return result.body;
  }

  async changePassword(
    changePasswordModel: IUserChangePasswordTestModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.changePasswordEndpoint}`)
      .send(changePasswordModel)
      .expect(statusCode);
    return result.body;
  }

  async login(loginModel: IUserLoginTestModel, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.loginEndpoint}`)
      .send(loginModel)
      .expect(statusCode);
    return result.body;
  }

  async loginAndCheckCookie(
    loginModel: IUserLoginTestModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.loginEndpoint}`)
      .send(loginModel)
      .expect(statusCode);

    const cookies = result.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
    const refreshTokenCookie = cookiesArray.find((cookie) =>
      cookie.startsWith('refreshToken='),
    );
    expect(refreshTokenCookie).toBeDefined();
    return result.body;
  }

  async loginAndReturnRefreshToken(
    loginModel: IUserLoginTestModel,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.loginEndpoint}`)
      .send(loginModel)
      .expect(statusCode);

    const cookies = result.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
    const refreshTokenCookie = cookiesArray.find((cookie) =>
      cookie.startsWith('refreshToken='),
    );
    expect(refreshTokenCookie).toBeDefined();

    const match = refreshTokenCookie.match(/refreshToken=([^;]*)/);

    return { body: result.body, refreshToken: match[1] };
  }

  async logOut(refreshToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .post(`${this.logoutEndpoint}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(statusCode);
    return result.body;
  }

  async getCurrentUser(authorizationToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.currentUserEndpoint}`)
      .set({ authorization: authorizationToken })
      .expect(statusCode);
    return result.body;
  }
}
