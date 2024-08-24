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
  APIErrorMessageType,
  APIErrorsMessageType,
  AppResultType,
  AuthorizationUserResponseType,
  JWTAccessTokenPayloadType,
  MailTemplateType,
} from '../../../base/types/types';
import {
  ChangePasswordInputModel,
  ConfirmUserByEmailInputModel,
  LoginInputModel,
  PasswordRecoveryInputModel,
  RegistrationInputModel,
  ResendConfirmationCodeInputModel,
} from '../api/models/input/auth-input.models';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from '../../user/application/user-service';
import { addDays, addMinutes, compareAsc } from 'date-fns';
import { AppSettings } from '../../../settings/app-setting';
import { NodeMailerService } from '../../nodemailer/application/nodemailer-application';
import { MailTemplateService } from '../../mail-template/application/template-application';

import {
  RecoveryPasswordSession,
  RecoveryPasswordSessionDocumentType,
  RecoveryPasswordSessionModelType,
} from '../domain/recovery-session.entity';
import { RecoveryPasswordSessionRepositories } from '../infrastructure/recovery-password-session-repositories';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly userRepositories: UserRepositories,
    private readonly appSettings: AppSettings,
    private readonly jwtService: JwtService,
    private readonly nodeMailerService: NodeMailerService,
    private readonly mailTemplateService: MailTemplateService,
    private readonly recoveryPasswordSessionRepositories: RecoveryPasswordSessionRepositories,
    @Inject('UUID') private readonly uuidv4: () => string,
    @InjectModel(RecoveryPasswordSession.name)
    private readonly recoveryPasswordSession: RecoveryPasswordSessionModelType,
    @InjectModel(User.name) private readonly userModel: UserModelType,
  ) {}
  async login(
    inputLoginModel: LoginInputModel,
  ): Promise<
    AppResultType<
      Omit<AuthorizationUserResponseType, 'refreshToken'>,
      APIErrorMessageType
    >
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
        errorField: { message: 'Email has been confirmed', field: 'code' },
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
  ): Promise<AppResultType<null, APIErrorsMessageType>> {
    const user: AppResultType<UserDocumentType, APIErrorsMessageType> =
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
      this.appSettings.staticSettings.uuidOptions.confirmationEmail.prefix,
      this.appSettings.staticSettings.uuidOptions.confirmationEmail.key,
    );
    const dateExpired: string = addDays(new Date(), 1).toISOString();

    const newUser: UserDocumentType = this.userModel.registrationUserInstance(
      registrationInputModel,
      hash,
      confirmationCode,
      dateExpired,
    );

    await this.userRepositories.save(newUser);

    const template: MailTemplateType =
      await this.mailTemplateService.getConfirmationTemplate(confirmationCode);
    this.nodeMailerService.sendMail([newUser.email], template);
    return { appResult: AppResult.Success, data: null };
  }

  async confirmUserByEmail(
    inputConfirmUserByEmailModel: ConfirmUserByEmailInputModel,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByConfirmCode(
        inputConfirmUserByEmailModel.code,
      );
    if (!user)
      return {
        appResult: AppResult.BadRequest,
        errorField: { message: 'Code not found', field: 'code' },
        data: null,
      };
    if (user.userConfirm.isConfirm)
      return {
        appResult: AppResult.BadRequest,
        errorField: { message: 'Email has been confirmed', field: 'code' },
        data: null,
      };
    if (compareAsc(new Date(), user.userConfirm.dataExpire) === 1)
      return {
        appResult: AppResult.BadRequest,
        errorField: {
          message: 'The confirmation code has expired',
          field: 'code',
        },
        data: null,
      };

    user.confirmEmail();

    await this.userRepositories.save(user);
    return { appResult: AppResult.Success, data: null };
  }

  async resendConfirmCode(
    inputResendConfirmCodeModel: ResendConfirmationCodeInputModel,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByEmail(
        inputResendConfirmCodeModel.email,
      );
    if (!user)
      return {
        appResult: AppResult.BadRequest,
        errorField: { message: 'Email is not found', field: 'email' },
        data: null,
      };
    if (user.userConfirm.isConfirm)
      return {
        appResult: AppResult.BadRequest,
        errorField: { message: 'Email has been confirmed', field: 'email' },
        data: null,
      };

    const confirmationCode: string = this.generateUuidCode(
      this.appSettings.staticSettings.uuidOptions.newConfirmationCode.prefix,
      this.appSettings.staticSettings.uuidOptions.newConfirmationCode.key,
    );
    const dateExpired: string = addDays(new Date(), 1).toISOString();

    user.updateConfirmationCode(confirmationCode, dateExpired);
    await this.userRepositories.save(user);

    const template: MailTemplateType =
      await this.mailTemplateService.getConfirmationTemplate(confirmationCode);
    this.nodeMailerService.sendMail([user.email], template);

    return { appResult: AppResult.Success, data: null };
  }

  async passwordRecovery(
    inputPasswordRecoveryModel: PasswordRecoveryInputModel,
  ): Promise<AppResultType> {
    const user: UserDocumentType | null =
      await this.userRepositories.getUserByEmail(
        inputPasswordRecoveryModel.email,
      );

    const confirmationCode: string = this.generateUuidCode(
      this.appSettings.staticSettings.uuidOptions.recoveryPasswordSessionCode
        .prefix,
      this.appSettings.staticSettings.uuidOptions.recoveryPasswordSessionCode
        .key,
    );

    if (user) {
      const dateExpired: string = addMinutes(new Date(), 20).toISOString();

      const recoverySession: RecoveryPasswordSessionDocumentType =
        this.recoveryPasswordSession.createSessionInstance(
          inputPasswordRecoveryModel,
          confirmationCode,
          dateExpired,
        );
      await this.recoveryPasswordSessionRepositories.save(recoverySession);
    }

    const template: MailTemplateType =
      await this.mailTemplateService.getRecoveryPasswordTemplate(
        confirmationCode,
      );
    this.nodeMailerService.sendMail(
      [inputPasswordRecoveryModel.email],
      template,
    );

    return { appResult: AppResult.Success, data: null };
  }

  async changeUserPassword(
    inputChangePasswordModel: ChangePasswordInputModel,
  ): Promise<AppResultType<null, APIErrorMessageType>> {
    const recoverySession: RecoveryPasswordSessionDocumentType | null =
      await this.recoveryPasswordSessionRepositories.getSessionByCode(
        inputChangePasswordModel.recoveryCode,
      );
    if (!recoverySession)
      return {
        appResult: AppResult.BadRequest,
        errorField: { message: 'Bad code', field: 'recoveryCode' },
        data: null,
      };
    const { expAt, email } = recoverySession;

    if (compareAsc(new Date(), expAt) === 1)
      return {
        appResult: AppResult.BadRequest,
        errorField: { message: 'Code is expired', field: 'recoveryCode' },
        data: null,
      };

    const user: UserDocumentType | null =
      await this.userRepositories.getUserByEmail(email);
    if (!user)
      return { appResult: AppResult.BadRequest, data: null, errorField: null };

    const hash = await this.generatePasswordHashAndSalt(
      inputChangePasswordModel.newPassword,
    );

    user.changePassword(hash);
    await this.userRepositories.save(user);
    await this.recoveryPasswordSessionRepositories.delete(recoverySession);
    return { appResult: AppResult.Success, data: null };
  }

  async generatePasswordHashAndSalt(password: string): Promise<string> {
    return await bcrypt.hash(
      password,
      this.appSettings.env.PASSWORD_HASH_ROUNDS,
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
