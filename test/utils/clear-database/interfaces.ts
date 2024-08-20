import { Types } from 'mongoose';

export interface IInsertOneResult {
  acknowledged: boolean;
  insertedId: Types.ObjectId;
}
