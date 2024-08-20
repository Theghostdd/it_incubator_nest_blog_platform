import { Types } from 'mongoose';

export interface IInsertResult {
  acknowledged: boolean;
  insertedId: Types.ObjectId;
}
