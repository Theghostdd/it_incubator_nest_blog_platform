import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth/application/auth-application';
import { LoginHandler } from './auth/application/command/login.command';
import { ConfirmUserEmailHandler } from './auth/application/command/confirm-user-email.command';
import { ChangeUserPasswordHandler } from './auth/application/command/change-user-password.command';
import { ResendConfirmationCodeHandler } from './auth/application/command/resend-confirmation-code.command';
import { PasswordRecoveryHandler } from './auth/application/command/password-recovery.command';
import { RegistrationHandler } from './auth/application/command/registration.command';
import { AuthController } from './auth/api/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RecoveryPasswordSession,
  RecoveryPasswordSessionSchema,
} from './auth/domain/recovery-session.entity';
import { v4 as uuidv4 } from 'uuid';
import { RecoveryPasswordSessionRepositories } from './auth/infrastructure/recovery-password-session-repositories';
import { UsersModule } from '../users/users.module';
import { MailTemplateModule } from '../mail-template/mail-template.module';
import { NodeMailerModule } from '../nodemailer/nodemailer.module';
import { AuthSessionRepositories } from './auth/infrastructure/auth-session-repositories';
import { CreateAuthSessionHandler } from './auth/application/command/create-auth-session.command';
import {
  AuthSession,
  AuthSessionSchema,
} from './auth/domain/auth-session.entity';
import { LogoutHandler } from './auth/application/command/logout.command';
import { UpdatePairTokenHandler } from './auth/application/command/update-new-pair-token.command';

export const UUIDProvider = {
  provide: 'UUID',
  useValue: uuidv4,
};

@Module({
  imports: [
    NodeMailerModule,
    forwardRef(() => UsersModule),
    MailTemplateModule,
    MongooseModule.forFeature([
      {
        name: RecoveryPasswordSession.name,
        schema: RecoveryPasswordSessionSchema,
      },
      {
        name: AuthSession.name,
        schema: AuthSessionSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RecoveryPasswordSessionRepositories,
    UUIDProvider,
    AuthSessionRepositories,
    LoginHandler,
    ConfirmUserEmailHandler,
    ChangeUserPasswordHandler,
    ResendConfirmationCodeHandler,
    PasswordRecoveryHandler,
    RegistrationHandler,
    CreateAuthSessionHandler,
    LogoutHandler,
    UpdatePairTokenHandler,
  ],
  exports: [AuthService, MongooseModule],
})
export class AccessControlModule {}
