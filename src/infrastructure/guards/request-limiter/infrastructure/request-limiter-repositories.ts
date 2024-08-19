import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  RequestLimiter,
  RequestLimiterDocumentType,
  RequestLimiterModelType,
} from '../domain/request-limiter.entity';
import { Types } from 'mongoose';

@Injectable()
export class RequestLimiterRepositories {
  constructor(
    @InjectModel(RequestLimiter.name)
    private readonly requestLimiterModel: RequestLimiterModelType,
  ) {}

  async save(request: RequestLimiterDocumentType): Promise<void> {
    await request.save();
  }

  async delete(request: RequestLimiterDocumentType): Promise<void> {
    await request.deleteOne();
  }

  async getRequestByIpAndUrl(
    ip: string,
    url: string,
  ): Promise<RequestLimiterDocumentType | null> {
    return this.requestLimiterModel.findOne({ ip: ip, url: url });
  }

  async getExpRequest(
    subSecond: string,
  ): Promise<RequestLimiterDocumentType[] | null> {
    return this.requestLimiterModel.find({ date: { $lt: subSecond } });
  }

  async deleteMany(ids: Types.ObjectId[]): Promise<void> {
    await this.requestLimiterModel.deleteMany({ _id: { $in: ids } });
  }
}
