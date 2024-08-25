import configuration from './configuration';
import { ConfigModule } from '@nestjs/config';
import { EnvState } from '../types/enum';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  // validate: validate,
  // ignoreEnvFile:
  //   process.env.ENV !== EnvState.DEVELOPMENT &&
  //   process.env.ENV !== EnvState.TESTING,
  envFilePath: ['.env.development'],
});
