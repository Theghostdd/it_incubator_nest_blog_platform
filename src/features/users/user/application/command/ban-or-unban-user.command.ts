import { UserBanInputModel } from '../../api/models/input/user-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { UserService } from '../user-service';
import { UserRepositories } from '../../infrastructure/user-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { User } from '../../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

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
    private readonly userService: UserService,
    private readonly userRepositories: UserRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
    @InjectDataSource() private readonly dataSource: DataSource,
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

      if (user.userBans.length > 0) user.deleteLastUserBan();
      user.banOrUnban(isBanned, banReason);

      await this.userRepositories.save(user, queryRunner);
      await queryRunner.commitTransaction();
      return this.applicationObjectResult.success(null);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.applicationObjectResult.internalServerError();
    } finally {
      await queryRunner.release();
    }
  }
}
