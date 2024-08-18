import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './settings/app-setting';
import { applyAppSettings } from './settings/apply-app-settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);

  await app.listen(appSettings.api.APP_PORT, () => {
    console.log(`Server started on port ${appSettings.api.APP_PORT}`);
    console.log(`Env: ${appSettings.env.getEnv()}`);
  });
}

bootstrap();
