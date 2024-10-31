import { AppResult } from '../enum/app-result.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApplicationObjectResult {
  success<T>(data: T) {
    return {
      appResult: AppResult.Success,
      data: data,
      errorField: null,
    };
  }

  badRequest<T, D = null>(data: T, additionally?: D) {
    return {
      appResult: AppResult.BadRequest,
      data: additionally,
      errorField: data,
    };
  }

  notFound() {
    return {
      appResult: AppResult.NotFound,
      data: null,
      errorField: null,
    };
  }

  unauthorized<T = null, D = null>(data?: T, error?: D) {
    return {
      appResult: AppResult.Unauthorized,
      data: data,
      errorField: error,
    };
  }

  forbidden<T = null, D = null>(data?: T, error?: D) {
    return {
      appResult: AppResult.Forbidden,
      data: data,
      errorField: error,
    };
  }

  internalServerError() {
    return {
      appResult: AppResult.InternalError,
      data: null,
      errorField: null,
    };
  }
}
