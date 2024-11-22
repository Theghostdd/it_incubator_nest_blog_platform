import { Module } from '@nestjs/common';
import { UserRepositories } from './user/infrastructure/user-repositories';
import { UserQueryRepositories } from './user/infrastructure/user-query-repositories';
import { UserService } from './user/application/user-service';
import { UserMapperOutputModel } from './user/api/models/output/user-output.model';
import { UserSortingQuery } from './user/api/models/input/user-input.model';
import { DeleteUserByIdHandler } from './user/application/command/delete-user.command';
import { CreateUserCommandHandler } from './user/application/command/create-user.command';
import { UserController } from './user/api/user-controller';
import { BcryptModule } from '../bcrypt/bcrypt.module';
import { User } from './user/domain/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserConfirmation } from './user/domain/user-confirm.entity';
import { UserRegistrationEventHandler } from './user/application/event/user-registration.event';
import { NodeMailerModule } from '../nodemailer/nodemailer.module';
import { MailTemplateModule } from '../mail-template/mail-template.module';
import { UserRecoveryPasswordEventHandler } from './user/application/event/user-recovery-password.event';
import { UserBan } from './user/domain/user-ban.entity';
import { BanOrUnBanUserCommandHandler } from './user/application/command/ban-or-unban-user.command';
import { UserBanRepositories } from './user/infrastructure/user-ban-repository';

export const UserProvider = {
  provide: 'User',
  useValue: User,
};

@Module({
  imports: [
    NodeMailerModule,
    MailTemplateModule,
    BcryptModule,
    TypeOrmModule.forFeature([User, UserBan, UserConfirmation]),
  ],
  controllers: [UserController],
  providers: [
    UserProvider,
    UserRepositories,
    UserQueryRepositories,
    UserService,
    UserMapperOutputModel,
    UserSortingQuery,
    DeleteUserByIdHandler,
    CreateUserCommandHandler,
    UserRegistrationEventHandler,
    UserRecoveryPasswordEventHandler,
    BanOrUnBanUserCommandHandler,
    UserBanRepositories,
  ],
  exports: [UserRepositories, UserQueryRepositories, UserService, UserProvider],
})
export class UsersModule {}
