import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  APIErrorMessageType,
  APIErrorsMessageType,
} from '../../../base/types/types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const error: APIErrorsMessageType = { errorsMessages: [] };
      const responseBody: any = exception.getResponse();

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((e: APIErrorMessageType) => {
          error.errorsMessages.push(e);
        });
      } else {
        error.errorsMessages.push(responseBody.message);
      }
      return response.status(status).json(error);
    }

    if (status === 401) {
      return response.sendStatus(401);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
