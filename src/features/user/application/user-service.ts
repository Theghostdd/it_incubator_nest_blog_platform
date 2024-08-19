import { Injectable } from '@nestjs/common';
import { UserRepositories } from '../infrastructure/user-repositories';
import { UserInputModel } from '../api/models/input/user-input.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocumentType, UserModelType } from '../domain/user.entity';
import { AuthService } from '../../auth/application/auth-application';
import { AppResult } from '../../../base/enum/app-result.enum';
import { APIErrorsMessageType, AppResultType } from '../../../base/types/types';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepositories: UserRepositories,
    private readonly authService: AuthService,
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}

  async createUser(
    userInputModel: UserInputModel,
  ): Promise<AppResultType<string, APIErrorsMessageType>> {
    const user: AppResultType<UserDocumentType, APIErrorsMessageType> =
      await this.checkUniqLoginAndEmail(
        userInputModel.email,
        userInputModel.login,
      );

    if (user.appResult !== AppResult.Success)
      return {
        appResult: AppResult.BadRequest,
        data: null,
        errorField: user.errorField,
      };

    const hash: string = await this.authService.generatePasswordHashAndSalt(
      userInputModel.password,
    );
    const newUser: UserDocumentType = this.userModel.createUserInstance(
      userInputModel,
      hash,
    );

    await this.userRepositories.save(newUser);
    return { appResult: AppResult.Success, data: newUser._id.toString() };
  }

  async deleteUser(id: string): Promise<AppResultType> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserById(id);
    if (!user) return { appResult: AppResult.NotFound, data: null };

    await this.userRepositories.delete(user);
    return { appResult: AppResult.Success, data: null };
  }

  async checkUniqLoginAndEmail(
    email: string,
    login: string,
  ): Promise<AppResultType<UserDocumentType, APIErrorsMessageType>> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByEmailOrLogin(email, login);
    if (user) {
      const errors: APIErrorsMessageType = { errorsMessages: [] };
      login === user.login
        ? errors.errorsMessages.push({
            message: 'Not unique login',
            field: 'login',
          })
        : false;
      email === user.email
        ? errors.errorsMessages.push({
            message: 'Not unique email',
            field: 'email',
          })
        : false;
      return {
        appResult: AppResult.BadRequest,
        data: user,
        errorField: errors,
      };
    }
    return { appResult: AppResult.Success, data: null };
  }
}
