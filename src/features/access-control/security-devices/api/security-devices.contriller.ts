import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  UnauthorizedException,
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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Security devices')
@ApiBearerAuth()
@Controller(apiPrefixSettings.SECURITY_DEVICES.security)
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOkResponse({
    description: 'Return all session for current user',
    isArray: true,
    type: SecurityDevicesOutputModel,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token is missing or invalid',
  })
  @ApiOperation({
    summary: 'Get all session by bearer refresh token',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for get all sessions.',
  })
  @Get(apiPrefixSettings.SECURITY_DEVICES.devices)
  @UseGuards(RefreshJWTAccessGuard)
  async getAllDevices(
    @CurrentUser()
    user: JWTRefreshTokenPayloadType & { iat: number; exp: number },
  ): Promise<SecurityDevicesOutputModel[]> {
    return await this.securityDevicesQueryRepository.getAllDevices(user);
  }

  @ApiResponse({
    status: 204,
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token is missing or invalid',
  })
  @ApiOperation({
    summary:
      'Delete all sessions exclude current session by bearer refresh token',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for delete all sessions exclude current session.',
  })
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
      case AppResult.Unauthorized:
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @ApiResponse({
    status: 204,
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Token is missing or invalid',
  })
  @ApiForbiddenResponse({
    description: 'Access to this session is not allowed',
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @ApiOperation({
    summary: 'Delete session by device id',
    description:
      'The refresh token is stored in cookies: "refreshToken" and is used for delete session by device id.',
  })
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
      case AppResult.Unauthorized:
        throw new UnauthorizedException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
