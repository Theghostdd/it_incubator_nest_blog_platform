import { UserInputModel } from '../../api/models/input/user-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  APIErrorsMessageType,
  AppResultType,
} from '../../../../base/types/types';
import {
  User,
  UserDocumentType,
  UserModelType,
} from '../../domain/user.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { UserService } from '../user-service';
import { AuthService } from '../../../auth/application/auth-application';
import { InjectModel } from '@nestjs/mongoose';
import { UserRepositories } from '../../infrastructure/user-repositories';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';

export class CreateUserCommand {
  constructor(public userInputModel: UserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements
    ICommandHandler<
      CreateUserCommand,
      AppResultType<string, APIErrorsMessageType>
    >
{
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly userRepositories: UserRepositories,
    @InjectModel(User.name) private readonly userModel: UserModelType,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(
    command: CreateUserCommand,
  ): Promise<AppResultType<string, APIErrorsMessageType>> {
    const user: AppResultType<UserDocumentType, APIErrorsMessageType> =
      await this.userService.checkUniqLoginAndEmail(
        command.userInputModel.email,
        command.userInputModel.login,
      );

    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(user.errorField);

    const hash: string = await this.authService.generatePasswordHashAndSalt(
      command.userInputModel.password,
    );
    const newUser: UserDocumentType = this.userModel.createUserInstance(
      command.userInputModel,
      hash,
    );

    await this.userRepositories.save(newUser);
    return this.applicationObjectResult.success(newUser._id.toString());
  }
}
