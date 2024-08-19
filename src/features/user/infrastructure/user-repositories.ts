import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocumentType, UserModelType } from '../domain/user.entity';

@Injectable()
export class UserRepositories {
  constructor(
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}

  async save(user: UserDocumentType): Promise<void> {
    await user.save();
  }

  async delete(user: UserDocumentType): Promise<void> {
    await user.deleteOne();
  }

  async getUserById(id: string): Promise<UserDocumentType | null> {
    return this.userModel.findOne({ _id: id });
  }

  async getUserByEmailOrLogin(
    email: string,
    login: string,
    emailOrLogin?: string,
  ): Promise<UserDocumentType | null> {
    return this.userModel.findOne({
      $or: [
        { email: emailOrLogin ? emailOrLogin : email },
        { login: emailOrLogin ? emailOrLogin : login },
      ],
    });
  }
}
