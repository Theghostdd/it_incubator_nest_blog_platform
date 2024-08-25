import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../base/types/types';
import { UserRepositories } from '../../infrastructure/user-repositories';
import { UserDocumentType } from '../../domain/user.entity';
import { AppResult } from '../../../../base/enum/app-result.enum';
import { ApplicationObjectResult } from '../../../../base/application-object-result/application-object-result';
import { UserService } from '../user-service';

export class DeleteUserByIdCommand {
  constructor(public id: string) {}
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
    const user: AppResultType<UserDocumentType | null> =
      await this.userService.userIsExistById(command.id);
    if (user.appResult === AppResult.NotFound)
      return this.applicationObjectResult.notFound();

    await this.userRepositories.delete(user.data);
    return this.applicationObjectResult.success(null);
  }
}
