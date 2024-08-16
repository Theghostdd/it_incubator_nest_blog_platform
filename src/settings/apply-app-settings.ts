import { INestApplication } from '@nestjs/common';
import { apiPrefixSettings } from './app-prefix-settings';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
  setApiPrefix(app);
};

const setApiPrefix = (app: INestApplication) => {
  app.setGlobalPrefix(apiPrefixSettings.API_PREFIX);
};
