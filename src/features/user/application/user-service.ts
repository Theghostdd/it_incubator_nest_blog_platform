import { Injectable } from '@nestjs/common';
import { UserRepositories } from '../infrastructure/user-repositories';
import { UserInputModel } from '../api/models/input/user-input.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocumentType, UserModelType } from '../domain/user.entity';
import { AuthService } from '../../auth/application/auth-application';
import { AppResult } from '../../../base/enum/app-result.enum';
import { AppResultType } from '../../../base/types/types';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepositories: UserRepositories,
    private readonly authService: AuthService,
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}

  async createUser(
    userInputModel: UserInputModel,
  ): Promise<AppResultType<string>> {
    const hash: string = await this.authService.generatePasswordHashAndSalt(
      userInputModel.password,
    );
    const user: UserDocumentType = this.userModel.createUserInstance(
      userInputModel,
      hash,
    );

    await this.userRepositories.save(user);
    return { appResult: AppResult.Success, data: user._id.toString() };
  }

  async deleteUser(id: string): Promise<AppResultType> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserById(id);
    if (!user) return { appResult: AppResult.Success, data: null };

    await this.userRepositories.delete(user);
    return { appResult: AppResult.Success, data: null };
  }
}
