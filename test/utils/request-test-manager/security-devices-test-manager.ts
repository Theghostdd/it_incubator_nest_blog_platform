import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from '../../../src/settings/app-prefix-settings';
import request from 'supertest';

export class SecurityDevicesTestManager {
  private readonly apiPrefix: string;
  private readonly securityEndpoint: string;
  private readonly securityDevicesEndpoint: string;

  constructor(private readonly app: INestApplication) {
    this.app = app;
    this.apiPrefix = apiPrefixSettings.API_PREFIX;
    this.securityEndpoint = apiPrefixSettings.SECURITY_DEVICES.security;
    this.securityDevicesEndpoint = `${this.apiPrefix}/${this.securityEndpoint}/${apiPrefixSettings.SECURITY_DEVICES.devices}`;
  }

  async getAllDevices(refreshToken: string, statusCode: number) {
    const result = await request(this.app.getHttpServer())
      .get(`${this.securityDevicesEndpoint}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(statusCode);
    return result.body;
  }

  async deleteDeviceByDeviceId(
    refreshToken: string,
    deviceId: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.securityDevicesEndpoint}/${deviceId}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(statusCode);
    return result.body;
  }

  async deleteAllDevicesExcludeCurrent(
    refreshToken: string,
    statusCode: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .delete(`${this.securityDevicesEndpoint}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(statusCode);
    return result.body;
  }
}
