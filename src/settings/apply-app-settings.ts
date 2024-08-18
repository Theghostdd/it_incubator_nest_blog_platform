import { INestApplication, ValidationPipe } from '@nestjs/common';
import { apiPrefixSettings } from './app-prefix-settings';
import { ValidationPipeOption } from '../infrastructure/pipe/validation/validation-pipe-option';
import { HttpExceptionFilter } from '../infrastructure/exceprion-filters/http-exception/http-exception-filters';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
  setApiPrefix(app);

  setPipes(app);

  setExceptionFilter(app);

  enableCors(app);
};

const setApiPrefix = (app: INestApplication) => {
  app.setGlobalPrefix(apiPrefixSettings.API_PREFIX);
};

const enableCors = (app: INestApplication) => {
  app.enableCors();
};
const setPipes = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe(new ValidationPipeOption()));
};

const setExceptionFilter = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};
