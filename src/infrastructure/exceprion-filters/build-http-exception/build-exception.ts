import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestException extends HttpException {
  constructor() {
    super('Too many request', HttpStatus.TOO_MANY_REQUESTS);
  }
}
