import { INestApplication, ValidationPipe } from '@nestjs/common';
import { apiPrefixSettings } from './app-prefix-settings';
import { ValidationPipeOption } from '../core/pipe/validation/validation-pipe-option';
import { HttpExceptionFilter } from '../core/exceprion-filters/http-exception/http-exception-filters';
import cookieParser from 'cookie-parser';

export const applyAppSettings = (app: INestApplication) => {
  setApiPrefix(app);

  setPipes(app);

  setExceptionFilter(app);

  enableCors(app);

  setCookieParser(app);
};

const setApiPrefix = (app: INestApplication) => {
  app.setGlobalPrefix(apiPrefixSettings.API_PREFIX);
};

const enableCors = (app: INestApplication) => {
  app.enableCors();
};
const setPipes = (app: INestApplication) => {
  const validationPipeOptions: ValidationPipeOption =
    new ValidationPipeOption();
  const validationPipe: ValidationPipe = new ValidationPipe(
    validationPipeOptions,
  );
  app.useGlobalPipes(validationPipe);
};

const setExceptionFilter = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};

const setCookieParser = (app: INestApplication) => {
  app.use(cookieParser());
};
