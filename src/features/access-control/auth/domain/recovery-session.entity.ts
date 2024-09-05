import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { PasswordRecoveryInputModel } from '../api/models/input/auth-input.models';

@Schema()
export class RecoveryPasswordSession {
  @Prop({ type: String, required: true, min: 3 })
  email: string;
  @Prop({ type: String, required: true, min: 1 })
  code: string;
  @Prop({ type: String, required: true })
  expAt: string;

  static createSessionInstance(
    inputPasswordRecoveryModel: PasswordRecoveryInputModel,
    confirmationCode: string,
    dateExpired: string,
  ) {
    const { email } = inputPasswordRecoveryModel;
    const session = new this();
    session.email = email;
    session.code = confirmationCode;
    session.expAt = dateExpired;
    return session;
  }
}

export const RecoveryPasswordSessionSchema = SchemaFactory.createForClass(
  RecoveryPasswordSession,
);
RecoveryPasswordSessionSchema.loadClass(RecoveryPasswordSession);

export type RecoveryPasswordSessionDocumentType =
  HydratedDocument<RecoveryPasswordSession>;

type RecoveryPasswordSessionStaticType = {
  createSessionInstance: (
    inputPasswordRecoveryModel: PasswordRecoveryInputModel,
    confirmationCode: string,
    dateExpired: string,
  ) => RecoveryPasswordSessionDocumentType;
};
export type RecoveryPasswordSessionModelType =
  Model<RecoveryPasswordSessionDocumentType> &
    RecoveryPasswordSessionStaticType;
