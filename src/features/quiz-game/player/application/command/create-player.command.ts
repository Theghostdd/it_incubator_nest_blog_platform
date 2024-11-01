import { User } from '../../../../users/user/domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { QuizGamePlayer } from '../../domain/quiz-game-player.entity';
import { Inject } from '@nestjs/common';
import { PlayerRepository } from '../../infrastructure/player-repositories';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';

export class CreatePlayerCommand {
  constructor(public user: User) {}
}

@CommandHandler(CreatePlayerCommand)
export class CreatePlayerHandler
  implements
    ICommandHandler<CreatePlayerCommand, AppResultType<QuizGamePlayer>>
{
  constructor(
    @Inject(QuizGamePlayer.name)
    private readonly quizGamePlayerEntity: typeof QuizGamePlayer,
    private readonly playerRepository: PlayerRepository,
    private readonly applicationObjectResult: ApplicationObjectResult,
  ) {}

  async execute(
    command: CreatePlayerCommand,
  ): Promise<AppResultType<QuizGamePlayer>> {
    const { user } = command;
    const newPlayer: QuizGamePlayer =
      this.quizGamePlayerEntity.createPlayer(user);

    const result: QuizGamePlayer = await this.playerRepository.save(newPlayer);
    return this.applicationObjectResult.success(result);
  }
}
