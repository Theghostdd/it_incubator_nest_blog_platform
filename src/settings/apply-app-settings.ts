import { INestApplication, ValidationPipe } from '@nestjs/common';
import { apiPrefixSettings } from './app-prefix-settings';
import { ValidationPipeOption } from '../core/pipe/validation/validation-pipe-option';
import { HttpExceptionFilter } from '../core/exceprion-filters/http-exception/http-exception-filters';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
import * as useragent from 'express-useragent';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const applyAppSettings = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(useragent.express());

  setApiPrefix(app);

  setPipes(app);

  setExceptionFilter(app);

  enableCors(app);

  setCookieParser(app);

  buildDocumentation(app);
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

const buildDocumentation = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Blog platform')
    .setDescription('The blog platform API')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);
};
