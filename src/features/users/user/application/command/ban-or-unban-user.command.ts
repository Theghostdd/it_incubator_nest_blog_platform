import { UserBanInputModel } from '../../api/models/input/user-input.model';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
  IEvent,
} from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { UserRepositories } from '../../infrastructure/user-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { User } from '../../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { UserBan } from '../../domain/user-ban.entity';
import { UserBanRepositories } from '../../infrastructure/user-ban-repository';
import { DeleteAllUserSessionsCommand } from '../../../../access-control/security-devices/application/command/delete-all-user-sessions.command';
import { AppResult } from '../../../../../base/enum/app-result.enum';

export class BanOrUnBanUserCommand {
  constructor(
    public userBanInputModel: UserBanInputModel,
    public userId: number,
  ) {}
}

@CommandHandler(BanOrUnBanUserCommand)
export class BanOrUnBanUserCommandHandler
  implements ICommandHandler<BanOrUnBanUserCommand, AppResultType<null>>
{
  constructor(
    private readonly userRepositories: UserRepositories,
    private readonly userBanRepositories: UserBanRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(command: BanOrUnBanUserCommand): Promise<AppResultType<null>> {
    const { banReason, isBanned } = command.userBanInputModel;
    const { userId } = command;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      const user: User | null = await this.userRepositories.getUserById(
        userId,
        queryRunner,
      );

      if (!user) return this.applicationObjectResult.notFound();
      if (user.isBan === isBanned)
        return this.applicationObjectResult.success(null);

      if (user.userBans.length > 0) user.deleteLastUserBan();
      user.banOrUnban(isBanned, banReason);

      await this.userBanRepositories.saveMany(user.userBans, queryRunner);

      await this.userRepositories.updateBanState(
        user.id,
        isBanned,
        queryRunner,
      );

      const deleteSessionsResult: AppResultType<boolean> =
        await this.commandBus.execute(
          new DeleteAllUserSessionsCommand(user.id),
        );

      if (
        deleteSessionsResult.appResult === AppResult.InternalError ||
        !deleteSessionsResult
      )
        return this.applicationObjectResult.internalServerError();

      await queryRunner.commitTransaction();
      return this.applicationObjectResult.success(null);
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
      return this.applicationObjectResult.internalServerError();
    } finally {
      await queryRunner.release();
    }
  }
}
