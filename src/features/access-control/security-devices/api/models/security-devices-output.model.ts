import { Injectable } from '@nestjs/common';
import { AuthSessionDocumentType } from '../../../auth/domain/auth-session.entity';

export class SecurityDevicesOutputModel {
  public ip: string;
  public title: string;
  public lastActiveDate: string;
  public deviceId: string;
}

@Injectable()
export class SecurityDeviceOutputModelMapper {
  modelsMapper(
    authSessions: AuthSessionDocumentType[],
  ): SecurityDevicesOutputModel[] {
    return authSessions.map((authSession: AuthSessionDocumentType) => {
      return {
        ip: authSession.ip,
        title: authSession.deviceName,
        lastActiveDate: authSession.issueAt,
        deviceId: authSession.dId,
      };
    });
  }
}
