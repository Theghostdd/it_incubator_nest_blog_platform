import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user/domain/user.entity';
import { UserRepositories } from './user/infrastructure/user-repositories';
import { UserQueryRepositories } from './user/infrastructure/user-query-repositories';
import { UserService } from './user/application/user-service';
import { UserMapperOutputModel } from './user/api/models/output/user-output.model';
import { UserSortingQuery } from './user/api/models/input/user-input.model';
import { DeleteUserByIdHandler } from './user/application/command/delete-user.command';
import { CreateUserCommandHandler } from './user/application/command/create-user.command';
import { UserController } from './user/api/user-controller';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    AccessControlModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    UserRepositories,
    UserQueryRepositories,
    UserService,
    UserMapperOutputModel,
    UserSortingQuery,
    DeleteUserByIdHandler,
    CreateUserCommandHandler,
  ],
  exports: [
    UserRepositories,
    UserQueryRepositories,
    UserService,
    MongooseModule,
  ],
})
export class UsersModule {}
