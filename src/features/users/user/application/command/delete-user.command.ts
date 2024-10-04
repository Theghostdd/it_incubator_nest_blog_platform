import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { UserRepositories } from '../../infrastructure/user-repositories';
import { AppResult } from '../../../../../base/enum/app-result.enum';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { UserService } from '../user-service';
import { User } from '../../domain/user.entity';

export class DeleteUserByIdCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdHandler
  implements ICommandHandler<DeleteUserByIdCommand, AppResultType>
{
  constructor(
    private readonly userRepositories: UserRepositories,
    private readonly userService: UserService,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async execute(command: DeleteUserByIdCommand): Promise<AppResultType> {
    const user: AppResultType<User | null> = await this.userService.getUserById(
      command.id,
    );
    if (user.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    user.data.deleteUser();
    await this.userRepositories.save(user.data);
    return this.applicationObjectResult.success(null);
  }
}
