import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class AuthSession {
  @Prop({ type: String, required: true, unique: true })
  dId: string;
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  deviceName: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  issueAt: string;
  @Prop({ type: String, required: true })
  expAt: string;

  static createSessionInstance(
    dId: string,
    ip: string,
    deviceName: string,
    userId: string,
    issueAt: string,
    expAt: string,
  ) {
    const session = new this();
    session.dId = dId;
    session.ip = ip;
    session.deviceName = deviceName;
    session.userId = userId;
    session.expAt = expAt;
    session.issueAt = issueAt;
    return session;
  }

  updateAuthSession(iat: string, exp: string) {
    this.issueAt = iat;
    this.expAt = exp;
  }
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
AuthSessionSchema.loadClass(AuthSession);

export type AuthSessionDocumentType = HydratedDocument<AuthSession>;

type AuthSessionStaticType = {
  createSessionInstance: (
    dId: string,
    ip: string,
    deviceName: string,
    userId: string,
    issueAt: string,
    expAt: string,
  ) => AuthSessionDocumentType;
};
export type AuthSessionModelType = Model<AuthSessionDocumentType> &
  AuthSessionStaticType;
