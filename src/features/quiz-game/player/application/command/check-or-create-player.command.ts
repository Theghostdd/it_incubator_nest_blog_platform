import { User } from '../../../../users/user/domain/user.entity';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { QuizGamePlayer } from '../../domain/quiz-game-player.entity';
import { PlayerRepository } from '../../infrastructure/player-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { CreatePlayerCommand } from './create-player.command';
import { UserRepositories } from '../../../../users/user/infrastructure/user-repositories';

export class CheckOrCreatePlayerByUserIdCommand {
  constructor(public userId: number) {}
}

@CommandHandler(CheckOrCreatePlayerByUserIdCommand)
export class CheckOrCreatePlayerByUserIdHandler
  implements
    ICommandHandler<
      CheckOrCreatePlayerByUserIdCommand,
      AppResultType<QuizGamePlayer>
    >
{
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly commandBus: CommandBus,
    private readonly userRepositories: UserRepositories,
  ) {}

  async execute(
    command: CheckOrCreatePlayerByUserIdCommand,
  ): Promise<AppResultType<QuizGamePlayer>> {
    const { userId } = command;

    const player: QuizGamePlayer | null =
      await this.playerRepository.getPlayerByUserId(userId);

    if (!player) {
      const user: User = await this.userRepositories.getUserById(userId);
      const newPlayer: AppResultType<QuizGamePlayer> =
        await this.commandBus.execute(new CreatePlayerCommand(user));
      return this.applicationObjectResult.success(newPlayer.data);
    }

    return this.applicationObjectResult.success(player);
  }
}
