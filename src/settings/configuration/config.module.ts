import configuration, { validate } from './configuration';
import { ConfigModule } from '@nestjs/config';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  validate: validate,
  // ignoreEnvFile:
  //   process.env.ENV !== EnvState.DEVELOPMENT &&
  //   process.env.ENV !== EnvState.TESTING,
  envFilePath: ['.env.development'],
});
