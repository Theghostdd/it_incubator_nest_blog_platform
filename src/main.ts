import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration/configuration';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply-app-settings';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const envSettings = configService.get('environmentSettings', { infer: true });
  await app.listen(envSettings.APP_PORT, () => {
    console.log(`Server started on port ${envSettings.APP_PORT}`);
    console.log(`Env: ${envSettings.getEnvState()}`);
  });
}

bootstrap();
