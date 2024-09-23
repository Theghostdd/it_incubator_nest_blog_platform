import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SecurityDevicesOutputModel } from './models/security-devices-output.model';
import { SecurityDevicesQueryRepository } from '../infrastructure/security-devices-query-repositories';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDevicesByDeviceIdCommand } from '../application/command/delete-device-by-id.command';
import { DeleteAllDevicesExcludeCurrentCommand } from '../application/command/delete-all-devices-exclude-current.command';
import { apiPrefixSettings } from '../../../../settings/app-prefix-settings';
import {
  AppResultType,
  JWTRefreshTokenPayloadType,
} from '../../../../base/types/types';
import { RefreshJWTAccessGuard } from '../../../../core/guards/jwt/jwt-refresh-toke.guard';
import { CurrentUser } from '../../../../core/decorators/current-user';
import { AppResult } from '../../../../base/enum/app-result.enum';

@Controller(apiPrefixSettings.SECURITY_DEVICES.security)
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}
  @Get(apiPrefixSettings.SECURITY_DEVICES.devices)
  @UseGuards(RefreshJWTAccessGuard)
  async getAllDevices(
    @CurrentUser()
    user: JWTRefreshTokenPayloadType & { iat: number; exp: number },
  ): Promise<SecurityDevicesOutputModel[]> {
    return await this.securityDevicesQueryRepository.getAllDevices(user);
  }

  @Delete(apiPrefixSettings.SECURITY_DEVICES.devices)
  @UseGuards(RefreshJWTAccessGuard)
  @HttpCode(204)
  async deleteAllDevicesExcludeCurrent(
    @CurrentUser()
    user: JWTRefreshTokenPayloadType,
  ) {
    const result: AppResultType = await this.commandBus.execute(
      new DeleteAllDevicesExcludeCurrentCommand(user),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(`${apiPrefixSettings.SECURITY_DEVICES.devices}/:deviceId`)
  @UseGuards(RefreshJWTAccessGuard)
  @HttpCode(204)
  async deleteDeviceByDeiceId(
    @Param('deviceId') deviceId: string,
    @CurrentUser()
    user: JWTRefreshTokenPayloadType,
  ) {
    const result: AppResultType = await this.commandBus.execute(
      new DeleteDevicesByDeviceIdCommand(user, deviceId),
    );
    switch (result.appResult) {
      case AppResult.Success:
        return;
      case AppResult.Forbidden:
        throw new ForbiddenException();
      case AppResult.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
