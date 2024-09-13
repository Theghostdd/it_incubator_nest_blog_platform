import { Module } from '@nestjs/common';
import { AuthService } from './auth/application/auth-application';
import { LoginHandler } from './auth/application/command/login.command';
import { ConfirmUserEmailHandler } from './auth/application/command/confirm-user-email.command';
import { ChangeUserPasswordHandler } from './auth/application/command/change-user-password.command';
import { ResendConfirmationCodeHandler } from './auth/application/command/resend-confirmation-code.command';
import { PasswordRecoveryHandler } from './auth/application/command/password-recovery.command';
import { RegistrationHandler } from './auth/application/command/registration.command';
import { AuthController } from './auth/api/auth.controller';
import { v4 as uuidv4 } from 'uuid';
import { RecoveryPasswordSessionRepositories } from './auth/infrastructure/recovery-password-session-repositories';
import { UsersModule } from '../users/users.module';
import { MailTemplateModule } from '../mail-template/mail-template.module';
import { NodeMailerModule } from '../nodemailer/nodemailer.module';
import { AuthSessionRepositories } from './auth/infrastructure/auth-session-repositories';
import { CreateAuthSessionHandler } from './auth/application/command/create-auth-session.command';
import { LogoutHandler } from './auth/application/command/logout.command';
import { UpdatePairTokenHandler } from './auth/application/command/update-new-pair-token.command';
import { SecurityDevicesQueryRepository } from './security-devices/infrastructure/security-devices-query-repositories';
import { SecurityDevicesController } from './security-devices/api/security-devices.contriller';
import { SecurityDeviceOutputModelMapper } from './security-devices/api/models/security-devices-output.model';
import { DeleteAllDevicesExcludeCurrentHandler } from './security-devices/application/command/delete-all-devices-exclude-current.command';
import { DeleteDeviceByDeviceIdHandler } from './security-devices/application/command/delete-device-by-id.command';
import { BcryptModule } from '../bcrypt/bcrypt.module';
import { AuthSessionFactory } from './auth/domain/auth-session.entity';
import { RecoveryPasswordSessionFactory } from './auth/domain/recovery-session.entity';

export const UUIDProvider = {
  provide: 'UUID',
  useValue: uuidv4,
};

@Module({
  imports: [NodeMailerModule, UsersModule, MailTemplateModule, BcryptModule],
  controllers: [AuthController, SecurityDevicesController],
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
    SecurityDevicesQueryRepository,
    SecurityDeviceOutputModelMapper,
    DeleteAllDevicesExcludeCurrentHandler,
    DeleteDeviceByDeviceIdHandler,
    AuthSessionFactory,
    RecoveryPasswordSessionFactory,
  ],
  exports: [AuthService, AuthSessionRepositories],
})
export class AccessControlModule {}
