import { forwardRef, Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UserRepositories } from '../../user/infrastructure/user-repositories';
import {
  User,
  UserDocumentType,
  UserModelType,
} from '../../user/domain/user.entity';
import { AppResult } from '../../../base/enum/app-result.enum';
import {
  AppResultType,
  AuthorizationUserResponseType,
  JWTAccessTokenPayloadType,
} from '../../../base/types/types';
import {
  LoginInputModel,
  RegistrationInputModel,
} from '../api/models/input/auth-input.models';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from '../../user/application/user-service';
import { addDays } from 'date-fns';
import { AppSettings } from '../../../settings/app-setting';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly userRepositories: UserRepositories,
    private readonly appSettings: AppSettings,
    private readonly jwtService: JwtService,
    @Inject('UUID') private readonly uuidv4: () => string,
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}
  async login(
    inputLoginModel: LoginInputModel,
  ): Promise<
    AppResultType<Omit<AuthorizationUserResponseType, 'refreshToken'>>
  > {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByEmailOrLogin(
        null,
        null,
        inputLoginModel.loginOrEmail,
      );
    if (!user) return { appResult: AppResult.Unauthorized, data: null };
    if (
      !(await this.comparePasswordHashAndSalt(
        inputLoginModel.password,
        user.password,
      ))
    )
      return { appResult: AppResult.Unauthorized, data: null };
    if (!user.userConfirm.isConfirm)
      return {
        appResult: AppResult.BadRequest,
        data: null,
        errorField: {
          errorsMessages: [
            { message: 'Email has been confirmed', field: 'code' },
          ],
        },
      };

    const payloadAccessToken: JWTAccessTokenPayloadType = {
      userId: user._id.toString(),
    };
    const accessToken: string =
      await this.jwtService.signAsync(payloadAccessToken);

    return {
      appResult: AppResult.Success,
      data: { accessToken: accessToken },
    };
  }

  async registration(
    registrationInputModel: RegistrationInputModel,
  ): Promise<AppResultType<string>> {
    const user: AppResultType<UserDocumentType> =
      await this.userService.checkUniqLoginAndEmail(
        registrationInputModel.email,
        registrationInputModel.login,
      );

    if (user.appResult !== AppResult.Success)
      return {
        appResult: AppResult.BadRequest,
        data: null,
        errorField: user.errorField,
      };

    const hash: string = await this.generatePasswordHashAndSalt(
      registrationInputModel.password,
    );

    const confirmationCode: string = this.generateUuidCode(
      this.appSettings.staticSettings.staticOptions.uuidOptions
        .confirmationEmail.prefix,
      this.appSettings.staticSettings.staticOptions.uuidOptions
        .confirmationEmail.key,
    );

    const dateExpired: string = addDays(new Date(), 1).toISOString();

    const newUser: UserDocumentType = this.userModel.registrationUserInstance(
      registrationInputModel,
      hash,
      confirmationCode,
      dateExpired,
    );

    await this.userRepositories.save(newUser);

    return { appResult: AppResult.Success, data: newUser._id.toString() };
  }

  async generatePasswordHashAndSalt(password: string): Promise<string> {
    return await bcrypt.hash(
      password,
      this.appSettings.api.PASSWORD_HASH_ROUNDS,
    );
  }

  async comparePasswordHashAndSalt(
    password: string,
    existingPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, existingPassword);
  }

  generateUuidCode(prefix: string, key: string): string {
    return `${prefix}-${this.uuidv4()}-${key}`;
  }
}
