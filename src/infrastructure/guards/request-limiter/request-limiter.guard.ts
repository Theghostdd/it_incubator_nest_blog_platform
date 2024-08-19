import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TooManyRequestException } from '../../exceprion-filters/build-http-exception/build-exception';
import { RequestLimiterStrategy } from './request-limiter';

@Injectable()
export class LimitRequestGuard implements CanActivate {
  constructor(private readonly requestLimiter: RequestLimiterStrategy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const result = await this.requestLimiter.requestLimiter(req);

    if (!result) {
      throw new TooManyRequestException();
    }

    return true;
  }
}
