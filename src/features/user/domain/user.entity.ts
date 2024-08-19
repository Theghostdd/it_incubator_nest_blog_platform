import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { UserInputModel } from '../api/models/input/user-input.model';
import { RegistrationInputModel } from '../../auth/api/models/input/auth-input.models';

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
  @Prop({
    type: {
      isConfirm: { type: Boolean, required: true, default: false },
      confirmationCode: { type: String, required: true },
      dataExpire: { type: String, required: true },
    },
    required: true,
    _id: false,
  })
  userConfirm: {
    isConfirm: boolean;
    confirmationCode: string;
    dataExpire: string;
  };

  static createUserInstance(inputModel: UserInputModel, hashPass: string) {
    const { login, email } = inputModel;
    const user = new this();
    user.login = login;
    user.email = email;
    user.password = hashPass;
    user.createdAt = new Date().toISOString();
    user.userConfirm = {
      isConfirm: true,
      confirmationCode: 'none',
      dataExpire: '0',
    };
    return user;
  }

  static registrationUserInstance(
    inputModel: RegistrationInputModel,
    hashPass: string,
    confirmCode: string,
    dateExpireConfirmCode: string,
  ) {
    const { login, email } = inputModel;
    const user = new this();
    user.login = login;
    user.email = email;
    user.password = hashPass;
    user.createdAt = new Date().toISOString();
    user.userConfirm = {
      isConfirm: false,
      confirmationCode: confirmCode,
      dataExpire: dateExpireConfirmCode,
    };
    return user;
  }

  confirmEmail(): void {
    this.userConfirm.isConfirm = true;
  }

  updateConfirmationCode(newCode: string, dateExpireConfirmCode: string): void {
    this.userConfirm.confirmationCode = newCode;
    this.userConfirm.dataExpire = dateExpireConfirmCode;
  }

  changePassword(newPassword: string): void {
    this.password = newPassword;
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

  registrationUserInstance: (
    inputModel: UserInputModel,
    hashPass: string,
    confirmCode: string,
    dateExpireConfirmCode: string,
  ) => UserDocumentType;
};

export type UserModelType = Model<UserDocumentType> & UserModelStaticType;
