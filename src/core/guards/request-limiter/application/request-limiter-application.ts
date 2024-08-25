import {
  RequestLimiter,
  RequestLimiterDocumentType,
  RequestLimiterModelType,
} from '../domain/request-limiter.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppResultType } from '../../../../base/types/types';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { compareAsc } from 'date-fns';
import { RequestLimiterRepositories } from '../infrastructure/request-limiter-repositories';
import { Types } from 'mongoose';
import { RequestLimiterModel } from '../request-limiter';

@Injectable()
export class RequestLimiterService {
  constructor(
    private readonly requestLimiterRepositories: RequestLimiterRepositories,
    @InjectModel(RequestLimiter.name)
    private readonly requestLimiterModel: RequestLimiterModelType,
  ) {}

  async limit(
    requestLimiterModel: RequestLimiterModel,
  ): Promise<AppResultType> {
    const request: RequestLimiterDocumentType | null =
      await this.requestLimiterRepositories.getRequestByIpAndUrl(
        requestLimiterModel.ip,
        requestLimiterModel.url,
      );
    if (!request) {
      const newRequest: RequestLimiterDocumentType =
        this.requestLimiterModel.createInstance(requestLimiterModel);
      await this.requestLimiterRepositories.save(newRequest);
      return { appResult: AppResult.Success, data: null };
    }

    const { date, quantity } = request;
    if (compareAsc(new Date(date), new Date()) === 1 && quantity >= 5) {
      return { appResult: AppResult.BadRequest, data: null };
    }

    if (compareAsc(new Date(date), new Date()) === 1 && quantity >= 1) {
      request.boost();
      await this.requestLimiterRepositories.save(request);
      return { appResult: AppResult.Success, data: null };
    }

    request.dumping(requestLimiterModel.date);
    await this.requestLimiterRepositories.save(request);
    return { appResult: AppResult.Success, data: null };
  }

  async clearRequest(subSecond: string): Promise<AppResultType> {
    const requests: RequestLimiterDocumentType[] | null =
      await this.requestLimiterRepositories.getExpRequest(subSecond);
    if (requests && requests.length > 0) {
      const requestIds: Types.ObjectId[] = requests.map(
        (items: RequestLimiterDocumentType) => items._id,
      );
      await this.requestLimiterRepositories.deleteMany(requestIds);
    }

    return { appResult: AppResult.Success, data: null };
  }
}
