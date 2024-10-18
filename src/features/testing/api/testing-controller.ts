import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingService } from '../application/testing-application';
import { apiPrefixSettings } from '../../../settings/app-prefix-settings';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Testing')
@Controller(
  `${apiPrefixSettings.TESTING.testing}/${apiPrefixSettings.TESTING.all_data}`,
)
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @ApiResponse({ status: 204, description: 'Delete all data' })
  @Delete()
  @HttpCode(204)
  async clearDb(): Promise<void> {
    return await this.testingService.clearDb();
  }
}
