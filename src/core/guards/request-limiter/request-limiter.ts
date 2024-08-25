import { Injectable, OnModuleInit } from '@nestjs/common';
import { RequestLimiterService } from './application/request-limiter-application';
import { Request } from 'express';
import { addSeconds, subSeconds } from 'date-fns';
import { AppResultType } from '../../../base/types/types';
import { AppResult } from '../../../base/enum/app-result.enum';

export class RequestLimiterModel {
  ip: string;
  url: string;
  date: string;
  quantity: number;
}
@Injectable()
export class RequestLimiterStrategy implements OnModuleInit {
  constructor(private readonly requestLimiterService: RequestLimiterService) {}
  async requestLimiter(req: Request) {
    if (!req.ip || !req.socket.remoteAddress) return false;

    const requestLimiterModel: RequestLimiterModel = {
      ip: req.ip || req.socket.remoteAddress,
      url: req.originalUrl,
      date: addSeconds(new Date(), 10).toISOString(),
      quantity: 1,
    };

    const result: AppResultType =
      await this.requestLimiterService.limit(requestLimiterModel);
    switch (result.appResult) {
      case AppResult.Success:
        return true;
      case AppResult.BadRequest:
        return false;
      default:
        return false;
    }
  }

  async clearRequestCollection() {
    await this.requestLimiterService.clearRequest(
      subSeconds(new Date(), 30).toISOString(),
    );
  }

  onModuleInit() {
    setInterval(() => {
      this.clearRequestCollection().catch((error) => {
        console.error('Error clearing request collection:', error);
      });
    }, 259200);
  }
}
