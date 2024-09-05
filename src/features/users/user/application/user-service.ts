import { Injectable } from '@nestjs/common';
import { UserRepositories } from '../infrastructure/user-repositories';
import { UserDocumentType } from '../domain/user.entity';
import {
  APIErrorsMessageType,
  AppResultType,
} from '../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepositories: UserRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

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

      return this.applicationObjectResult.badRequest(errors, user);
    }
    return this.applicationObjectResult.success(null);
  }

  async userIsExistById(
    id: string,
  ): Promise<AppResultType<UserDocumentType | null>> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserById(id);
    if (!user) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(user);
  }

  async userIsExistByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<AppResultType<UserDocumentType | null>> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByEmailOrLogin(
        null,
        null,
        loginOrEmail,
      );
    if (!user) return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(user);
  }

  async userIsExistByConfirmationCode(
    code: string,
  ): Promise<AppResultType<UserDocumentType | null>> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByConfirmCode(code);

    if (!user) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(user);
  }

  async userIsExistByEmail(
    email: string,
  ): Promise<AppResultType<UserDocumentType | null>> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByEmail(email);

    if (!user) return this.applicationObjectResult.notFound();
    return this.applicationObjectResult.success(user);
  }
}
