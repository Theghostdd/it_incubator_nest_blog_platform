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

export const UserProvider = {
  provide: 'User',
  useValue: User,
};

@Module({
  imports: [BcryptModule, TypeOrmModule.forFeature([User, UserConfirmation])],
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
  ],
  exports: [UserRepositories, UserQueryRepositories, UserService],
})
export class UsersModule {}
