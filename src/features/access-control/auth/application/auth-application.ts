import { forwardRef, Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  RecoveryPasswordSession,
  RecoveryPasswordSessionDocumentType,
  RecoveryPasswordSessionModelType,
} from '../domain/recovery-session.entity';
import { RecoveryPasswordSessionRepositories } from '../infrastructure/recovery-password-session-repositories';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../../users/user/application/user-service';
import { StaticOptions } from '../../../../settings/app-static-settings';
import { EnvSettings } from '../../../../settings/env-settings';
import { APISettings } from '../../../../settings/api-settings';
import { UserRepositories } from '../../../users/user/infrastructure/user-repositories';
import { ConfigurationType } from '../../../../settings/configuration/configuration';
import { NodeMailerService } from '../../../nodemailer/application/nodemailer-application';
import { MailTemplateService } from '../../../mail-template/application/template-application';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { User, UserModelType } from '../../../users/user/domain/user.entity';
import {
  AppResultType,
  JWTAccessTokenPayloadType,
  JWTRefreshTokenPayloadType,
} from '../../../../base/types/types';

@Injectable()
export class AuthService {
  private readonly staticOptions: StaticOptions;
  private readonly envSettings: EnvSettings;
  private readonly apiSettings: APISettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly jwtService: JwtService,
    private readonly recoveryPasswordSessionRepositories: RecoveryPasswordSessionRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @Inject('UUID') private readonly uuidv4: () => string,
    @InjectModel(RecoveryPasswordSession.name)
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
  ) {
    this.envSettings = this.configService.get('environmentSettings', {
      infer: true,
    });
    this.apiSettings = this.configService.get('apiSettings', { infer: true });
  }

  // async login(
  //   inputLoginModel: LoginInputModel,
  // ): Promise<
  //   AppResultType<
  //     Omit<AuthorizationUserResponseType, 'refreshToken'>,
  //     APIErrorMessageType
  //   >
  // > {
  //   const user: UserDocumentType | null =
  //     await this.userRepositories.getUserByEmailOrLogin(
  //       null,
  //       null,
  //       inputLoginModel.loginOrEmail,
  //     );
  //   if (!user) return { appResult: AppResult.Unauthorized, data: null };
  //   if (
  //     !(await this.comparePasswordHashAndSalt(
  //       inputLoginModel.password,
  //       user.password,
  //     ))
  //   )
  //     return { appResult: AppResult.Unauthorized, data: null };
  //   if (!user.userConfirm.isConfirm)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       data: null,
  //       errorField: { message: 'Email has been confirmed', field: 'code' },
  //     };
  //
  //   const payloadAccessToken: JWTAccessTokenPayloadType = {
  //     userId: user._id.toString(),
  //   };
  //   const accessToken: string = await this.jwtService.signAsync(
  //     payloadAccessToken,
  //     {
  //       secret: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.SECRET,
  //       expiresIn: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.EXPIRES,
  //     },
  //   );
  //
  //   return {
  //     appResult: AppResult.Success,
  //     data: { accessToken: accessToken },
  //   };
  // }

  // async registration(
  //   registrationInputModel: RegistrationInputModel,
  // ): Promise<AppResultType<null, APIErrorsMessageType>> {
  //   const user: AppResultType<UserDocumentType, APIErrorsMessageType> =
  //     await this.userService.checkUniqLoginAndEmail(
  //       registrationInputModel.email,
  //       registrationInputModel.login,
  //     );
  //
  //   if (user.appResult !== AppResult.Success)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       data: null,
  //       errorField: user.errorField,
  //     };
  //
  //   const hash: string = await this.generatePasswordHashAndSalt(
  //     registrationInputModel.password,
  //   );
  //
  //   const confirmationCode: string = this.generateUuidCode(
  //     this.staticOptions.uuidOptions.confirmationEmail.prefix,
  //     this.staticOptions.uuidOptions.confirmationEmail.key,
  //   );
  //   const dateExpired: string = addDays(new Date(), 1).toISOString();
  //
  //   const newUser: UserDocumentType = this.userModel.registrationUserInstance(
  //     registrationInputModel,
  //     hash,
  //     confirmationCode,
  //     dateExpired,
  //   );
  //
  //   await this.userRepositories.save(newUser);
  //
  //   const template: MailTemplateType =
  //     await this.mailTemplateService.getConfirmationTemplate(confirmationCode);
  //   this.nodeMailerService.sendMail([newUser.email], template);
  //   return { appResult: AppResult.Success, data: null };
  // }

  // async confirmUserByEmail(
  //   inputConfirmUserByEmailModel: ConfirmUserByEmailInputModel,
  // ): Promise<AppResultType<null, APIErrorMessageType>> {
  //   const user: UserDocumentType | null =
  //     await this.userRepositories.getUserByConfirmCode(
  //       inputConfirmUserByEmailModel.code,
  //     );
  //   if (!user)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       errorField: { message: 'Code not found', field: 'code' },
  //       data: null,
  //     };
  //   if (user.userConfirm.isConfirm)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       errorField: { message: 'Email has been confirmed', field: 'code' },
  //       data: null,
  //     };
  //   if (compareAsc(new Date(), user.userConfirm.dataExpire) === 1)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       errorField: {
  //         message: 'The confirmation code has expired',
  //         field: 'code',
  //       },
  //       data: null,
  //     };
  //
  //   user.confirmEmail();
  //
  //   await this.userRepositories.save(user);
  //   return { appResult: AppResult.Success, data: null };
  // }

  // async resendConfirmCode(
  //   inputResendConfirmCodeModel: ResendConfirmationCodeInputModel,
  // ): Promise<AppResultType<null, APIErrorMessageType>> {
  //   const user: UserDocumentType | null =
  //     await this.userRepositories.getUserByEmail(
  //       inputResendConfirmCodeModel.email,
  //     );
  //   if (!user)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       errorField: { message: 'Email is not found', field: 'email' },
  //       data: null,
  //     };
  //   if (user.userConfirm.isConfirm)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       errorField: { message: 'Email has been confirmed', field: 'email' },
  //       data: null,
  //     };
  //
  //   const confirmationCode: string = this.generateUuidCode(
  //     this.staticOptions.uuidOptions.newConfirmationCode.prefix,
  //     this.staticOptions.uuidOptions.newConfirmationCode.key,
  //   );
  //   const dateExpired: string = addDays(new Date(), 1).toISOString();
  //
  //   user.updateConfirmationCode(confirmationCode, dateExpired);
  //   await this.userRepositories.save(user);
  //
  //   const template: MailTemplateType =
  //     await this.mailTemplateService.getConfirmationTemplate(confirmationCode);
  //   this.nodeMailerService.sendMail([user.email], template);
  //
  //   return { appResult: AppResult.Success, data: null };
  // }

  // async passwordRecovery(
  //   inputPasswordRecoveryModel: PasswordRecoveryInputModel,
  // ): Promise<AppResultType> {
  //   const user: UserDocumentType | null =
  //     await this.userRepositories.getUserByEmail(
  //       inputPasswordRecoveryModel.email,
  //     );
  //
  //   const confirmationCode: string = this.generateUuidCode(
  //     this.staticOptions.uuidOptions.recoveryPasswordSessionCode.prefix,
  //     this.staticOptions.uuidOptions.recoveryPasswordSessionCode.key,
  //   );
  //
  //   if (user) {
  //     const dateExpired: string = addMinutes(new Date(), 20).toISOString();
  //
  //     const recoverySession: RecoveryPasswordSessionDocumentType =
  //       this.recoveryPasswordSession.createSessionInstance(
  //         inputPasswordRecoveryModel,
  //         confirmationCode,
  //         dateExpired,
  //       );
  //     await this.recoveryPasswordSessionRepositories.save(recoverySession);
  //   }
  //
  //   const template: MailTemplateType =
  //     await this.mailTemplateService.getRecoveryPasswordTemplate(
  //       confirmationCode,
  //     );
  //   this.nodeMailerService.sendMail(
  //     [inputPasswordRecoveryModel.email],
  //     template,
  //   );
  //
  //   return { appResult: AppResult.Success, data: null };
  // }

  // async changeUserPassword(
  //   inputChangePasswordModel: ChangePasswordInputModel,
  // ): Promise<AppResultType<null, APIErrorMessageType>> {
  //   const recoverySession: RecoveryPasswordSessionDocumentType | null =
  //     await this.recoveryPasswordSessionRepositories.getSessionByCode(
  //       inputChangePasswordModel.recoveryCode,
  //     );
  //   if (!recoverySession)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       errorField: { message: 'Bad code', field: 'recoveryCode' },
  //       data: null,
  //     };
  //   const { expAt, email } = recoverySession;
  //
  //   if (compareAsc(new Date(), expAt) === 1)
  //     return {
  //       appResult: AppResult.BadRequest,
  //       errorField: { message: 'Code is expired', field: 'recoveryCode' },
  //       data: null,
  //     };
  //
  //   const user: UserDocumentType | null =
  //     await this.userRepositories.getUserByEmail(email);
  //   if (!user)
  //     return { appResult: AppResult.BadRequest, data: null, errorField: null };
  //
  //   const hash = await this.generatePasswordHashAndSalt(
  //     inputChangePasswordModel.newPassword,
  //   );
  //
  //   user.changePassword(hash);
  //   await this.userRepositories.save(user);
  //   await this.recoveryPasswordSessionRepositories.delete(recoverySession);
  //   return { appResult: AppResult.Success, data: null };
  // }

  async generatePasswordHashAndSalt(password: string): Promise<string> {
    return await bcrypt.hash(password, this.envSettings.PASSWORD_HASH_ROUNDS);
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

  async generateAccessToken(payload: JWTAccessTokenPayloadType) {
    return await this.jwtService.signAsync(payload, {
      secret: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.SECRET,
      expiresIn: this.apiSettings.JWT_TOKENS.ACCESS_TOKEN.EXPIRES,
    });
  }

  async generateRefreshToken(payload: JWTRefreshTokenPayloadType) {
    return await this.jwtService.signAsync(payload, {
      secret: this.apiSettings.JWT_TOKENS.REFRESH_TOKEN.SECRET,
      expiresIn: this.apiSettings.JWT_TOKENS.REFRESH_TOKEN.EXPIRES,
    });
  }

  async recoveryPasswordSessionIsExistByCode(
    code: string,
  ): Promise<AppResultType<RecoveryPasswordSessionDocumentType | null>> {
    const recoveryPasswordSession: RecoveryPasswordSessionDocumentType | null =
      await this.recoveryPasswordSessionRepositories.getSessionByCode(code);

    if (!recoveryPasswordSession)
      return this.applicationObjectResult.notFound();

    return this.applicationObjectResult.success(recoveryPasswordSession);
  }
}