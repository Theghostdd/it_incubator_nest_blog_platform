import { Injectable } from '@nestjs/common';
import { AuthSession } from '../../../auth/domain/auth-session.entity';

export class SecurityDevicesOutputModel {
  public ip: string;
  public title: string;
  public lastActiveDate: string;
  public deviceId: string;
}

@Injectable()
export class SecurityDeviceOutputModelMapper {
  modelsMapper(authSessions: AuthSession[]): SecurityDevicesOutputModel[] {
    return authSessions.map((authSession: AuthSession) => {
      return {
        ip: authSession.ip,
        title: authSession.deviceName,
        lastActiveDate: authSession.issueAt.toISOString(),
        deviceId: authSession.deviceId,
      };
    });
  }
}
