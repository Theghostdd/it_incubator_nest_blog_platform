import { CommandHandler, ICommandHandler, IEventHandler } from '@nestjs/cqrs';
import { AuthSessionRepositories } from '../../../auth/infrastructure/auth-session-repositories';
import { AuthSession } from '../../../auth/domain/auth-session.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';

export class DeleteAllUserSessionsCommand {
  constructor(public userId: number) {}
}

@CommandHandler(DeleteAllUserSessionsCommand)
export class DeleteAllUserSessionsHandler
  implements ICommandHandler<DeleteAllUserSessionsCommand, AppResultType>
{
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly authSessionRepositories: AuthSessionRepositories,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}
  async execute(command: DeleteAllUserSessionsCommand): Promise<AppResultType> {
    const { userId } = command;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const sessions: AuthSession[] | null =
        await this.authSessionRepositories.getSessionsByUserId(
          userId,
          queryRunner,
        );

      if (!sessions) return this.applicationObjectResult.notFound();

      const ids: string[] = sessions.map(
        (session: AuthSession) => session.deviceId,
      );

      if (ids.length > 0)
        await this.authSessionRepositories.deleteManySessions(ids, queryRunner);

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
