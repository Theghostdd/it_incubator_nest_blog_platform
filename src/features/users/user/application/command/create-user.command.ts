import { UserInputModel } from '../../api/models/input/user-input.model';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  APIErrorsMessageType,
  AppResultType,
} from '../../../../../base/types/types';
import { UserService } from '../user-service';
import { UserRepositories } from '../../infrastructure/user-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { BcryptService } from '../../../../bcrypt/application/bcrypt-application';
import { User } from '../../domain/user.entity';
import { Inject } from '@nestjs/common';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { CreatePlayerCommand } from '../../../../quiz-game/player/application/command/create-player.command';

export class CreateUserCommand {
  constructor(public userInputModel: UserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements
    ICommandHandler<
      CreateUserCommand,
      AppResultType<number, APIErrorsMessageType>
    >
{
  constructor(
    private readonly userService: UserService,
    private readonly userRepositories: UserRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly bcryptService: BcryptService,
    @Inject(User.name) private readonly userEntity: typeof User,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(
    command: CreateUserCommand,
  ): Promise<AppResultType<number, APIErrorsMessageType>> {
    const { email, login, password } = command.userInputModel;
    const user: AppResultType<User, APIErrorsMessageType> =
      await this.userService.checkUniqLoginAndEmail(email, login);

    if (user.appResult !== AppResult.Success)
      return this.applicationObjectResult.badRequest(user.errorField);

    const hash: string =
      await this.bcryptService.generatePasswordHashAndSalt(password);

    const date: Date = new Date();
    const newUser: User = this.userEntity.createUser(
      command.userInputModel,
      date,
      hash,
    );

    const result: number = await this.userRepositories.save(newUser);
    newUser.id = result;
    await this.commandBus.execute(new CreatePlayerCommand(newUser));
    return this.applicationObjectResult.success(result);
  }
}
