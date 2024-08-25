import mongoose, {
  HydratedDocument,
  Model,
  Schema as MongooseSchema,
} from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RequestLimiterModel } from '../request-limiter';

@Schema()
export class RequestLimiter {
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  url: string;
  @Prop({ type: String, required: true })
  date: string;
  @Prop({ type: Number, required: true })
  quantity: number;

  static createInstance(requestLimiterModel: RequestLimiterModel) {
    const { quantity, url, ip, date } = requestLimiterModel;
    const request = new this();
    request.quantity = quantity;
    request.url = url;
    request.date = date;
    request.ip = ip;
    return request;
  }
  boost() {
    ++this.quantity;
  }

  dumping(date: string) {
    this.quantity = 1;
    this.date = date;
  }
}

export const RequestLimiterSchema: MongooseSchema<RequestLimiter> =
  SchemaFactory.createForClass(RequestLimiter);
RequestLimiterSchema.loadClass(RequestLimiter);
export type RequestLimiterDocumentType = HydratedDocument<RequestLimiter>;

type RequestLimiterModelStaticType = {
  createInstance: (
    requestLimiterModel: RequestLimiterModel,
  ) => RequestLimiterDocumentType;
};

export type RequestLimiterModelType = Model<RequestLimiterDocumentType> &
  RequestLimiterModelStaticType;
