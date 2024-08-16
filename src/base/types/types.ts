import { AppResult } from '../enum/app-result.enum';

export type AppResultType<T = null> = {
  data: T;
  errorField?: null;
  appResult: AppResult;
};
