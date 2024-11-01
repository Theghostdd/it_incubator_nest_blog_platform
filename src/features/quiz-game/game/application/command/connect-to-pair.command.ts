import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppResultType } from '../../../../../base/types/types';
import { ApplicationObjectResult } from '../../../../../base/application-object-result/application-object-result';
import { Inject } from '@nestjs/common';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameRepositories } from '../../infrastructure/quiz-game-repositories';
import { QuizGamePlayer } from '../../../player/domain/quiz-game-player.entity';
import { CheckOrCreatePlayerByUserIdCommand } from '../../../player/application/command/check-or-create-player.command';
import { GameQuestionRepository } from '../../../questions/infrastructure/game-question-repositories';
import { QuizQuestions } from '../../../questions/domain/questions.entity';

export class ConnectToPairGameCommand {
  constructor(public userId: number) {}
}

@CommandHandler(ConnectToPairGameCommand)
export class ConnectToPairGameHandler
  implements ICommandHandler<ConnectToPairGameCommand, AppResultType<number>>
{
  constructor(
    @Inject(QuizGame.name) private readonly quizGameEntity: typeof QuizGame,
    private readonly applicationObjectResult: ApplicationObjectResult,
    private readonly quizGameRepositories: QuizGameRepositories,
    private readonly commandBus: CommandBus,
    private readonly gameQuestionRepository: GameQuestionRepository,
  ) {}
  async execute(
    command: ConnectToPairGameCommand,
  ): Promise<AppResultType<number>> {
    const { userId } = command;

    const player: AppResultType<QuizGamePlayer> = await this.commandBus.execute(
      new CheckOrCreatePlayerByUserIdCommand(userId),
    );

    const currentPlayerGame: QuizGame | null =
      await this.quizGameRepositories.getCurrentPlayerGame(player.data.id);

    if (currentPlayerGame) return this.applicationObjectResult.forbidden();

    const pendingGame: QuizGame | null =
      await this.quizGameRepositories.getRandomPendingGame();
    if (!pendingGame) {
      const randomQuestions: QuizQuestions[] =
        await this.gameQuestionRepository.getFiveRandomQuestions();
      const newGame: QuizGame = this.quizGameEntity.createGame(
        player.data,
        randomQuestions,
      );
      const result: number = await this.quizGameRepositories.save(newGame);
      return this.applicationObjectResult.success(result);
    }
    pendingGame.connectToGame(player.data);
    const result: number = await this.quizGameRepositories.save(pendingGame);
    return this.applicationObjectResult.success(result);
  }
}
