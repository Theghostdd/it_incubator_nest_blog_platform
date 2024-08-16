import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { UserInputModel } from '../api/models/input/user-input.model';

@Schema()
export class User {
  @Prop({ type: String, required: true, min: 3, max: 10, unique: true })
  login: string;
  @Prop({ type: String, required: true, min: 3, unique: true })
  email: string;
  @Prop({ type: String, required: true, min: 6, max: 20 })
  password: string;
  @Prop({ type: String, required: true, default: new Date().toISOString() })
  createdAt: string;

  static createUserInstance(inputModel: UserInputModel, hashPass: string) {
    const { login, email } = inputModel;
    const user = new this();
    user.login = login;
    user.email = email;
    user.password = hashPass;
    user.createdAt = new Date().toISOString();
    return user;
  }
}

export const UserSchema: MongooseSchema<User> =
  SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

export type UserDocumentType = HydratedDocument<User>;

type UserModelStaticType = {
  createUserInstance: (
    inputModel: UserInputModel,
    hashPass: string,
  ) => UserDocumentType;
};

export type UserModelType = Model<UserDocumentType> & UserModelStaticType;
