import { Injectable } from '@nestjs/common';
import { AuthSession } from '../../../auth/domain/auth-session.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SecurityDevicesOutputModel {
  @ApiProperty({
    description: 'Device ip',
    example: '123.0.123.0',
    type: String,
  })
  public ip: string;
  @ApiProperty({
    description: 'Device name',
    example: 'iPhone 16 Pro',
    type: String,
  })
  public title: string;
  @ApiProperty({
    description: 'Last activity date',
    example: '2023-01-01T00:00:00Z',
    type: String,
  })
  public lastActiveDate: string;
  @ApiProperty({
    description: 'Device id',
    example: 'device-id-123456-789',
    type: String,
  })
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
